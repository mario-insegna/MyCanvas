using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using ComBiz.Services.Editor;
using ComBiz.Services;
using MyCanvas.Editor.AppCode.Objects;
using MyCanvas.Editor.Models.EditorApi;
using CatalogService = Services.Framework.Ecommerce.CatalogService;
using Serilog;
using Cover = MyCanvas.ProjectData.Cover;
using CoverColor = MyCanvas.ProjectData.CoverColor;
using CoverLayout = MyCanvas.ProjectData.CoverLayout;
using Services.Framework.ComBiz.Editor;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class CoversController : ApiController
    {
        private static readonly ILogger Logger = Common.Log.ForContext<CoversController>();
        private readonly EditorServices _editorServices;
        private const int DefaultCoverMinPages = 20;
        private const int DefaultIconColorHeight = 50;
        private const int DefaultIconColorWidth = 50;

        public CoversController()
        {
            _editorServices = new EditorServices();
        }

        private decimal GetPriceByItem(string item)
        {
            var ret = 0M;
            try
            {
                ret = CatalogService.GetInstance().GetItem("MyCanvas", item, null).Price;
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "GetPriceByItem - {0}", item);
            }
            return ret;
        }

        private CoversModel.Response ToCoverResponse(Cover cover)
        {
	        try
	        {
		        return new CoversModel.Response
		        {
			        CoverId = cover.CoverId,
		            Name = cover.Name,
		            DisplayName = cover.DisplayName,
                    MaxPages = cover.MaxPages,
			        MinPages = cover.MinPages ?? DefaultCoverMinPages,
			        Sku = cover.Sku,
			        BasePrice = GetPriceByItem(cover.Sku),
			        PagePrice = GetPriceByItem(cover.Product.ExtraPageSku),
			        Binding = cover.Description,
			        Layouts = cover.CoverLayouts.Select(ToCoverLayoutResponse).ToList(),
			        Colors = cover.CoverColors.Select(ToCoverColorsModelResponse).ToList(),
			        CoverTypeId = cover.CoverTypeId,
		        };
	        }
			catch (Exception)
	        {
				return new CoversModel.Response();
	        }
        }

        private CoverColorsModel.Response ToCoverColorsModelResponse(CoverColor color)
        {
            return new CoverColorsModel.Response
            {
                CoverColorId = color.CoverColorId,
                DisplayName = color.DisplayName,
                CoverPageInsidePreview = _editorServices.CoverLayouts.GetCoverLayoutThumbnailUrl(color.CoverPageInsidePreview),
                CoverPageOutsidePreview = _editorServices.CoverLayouts.GetCoverLayoutThumbnailUrl(color.CoverPageOutsidePreview),
                TextColor = color.TextColor,
                ColorPreview = new ImageObject
                {
                    Name = color.Name,
                    ImageId = color.SwatchPreview.ToString(),
                    Height = DefaultIconColorHeight,
                    Width = DefaultIconColorWidth,
                    ThumbUrl = _editorServices.CoverLayouts.GetCoverLayoutThumbnailUrl(color.SwatchPreview),
                    Url = _editorServices.CoverLayouts.GetCoverLayoutThumbnailUrl(color.BackgroundPreview)
                }
            };
        }

        private GetCoverLayoutResponse ToCoverLayoutResponse(CoverLayout coverLayout)
        {
            return new CoverLayoutModel
            {
                CoverLayoutId = coverLayout.CoverLayoutId,
                Width = coverLayout.Cover.Width,
                Height = coverLayout.Cover.Height,
                PreviewImageUrl = _editorServices.CoverLayouts.GetCoverLayoutThumbnailUrl(coverLayout.PreviewImage)
            };
        }

        [HttpGet]
        public List<CoversModel.Response> GetCoversByProductId(int productId)
        {
            var covers = _editorServices.Covers.GetCoversByProductId(productId);
            var ret = covers.Select(ToCoverResponse).ToList();
            return ret;
        }

        [HttpGet]
        public CoversModel.Response GetCoverByProductId(int productId)
        {
            var cover = _editorServices.Covers.GetCoverByProductId(productId);
            var ret = ToCoverResponse(cover);
            return ret;
        }

        [HttpGet]
        public CoversModel.Response GetCoverByProjectId(int id)
        {
            var cover = _editorServices.Covers.GetCoverByProjectId(id);
            var ret = ToCoverResponse(cover);
            return ret;
        }

        [HttpGet]
        public CoversModel.Response GetCoverByCoverLayoutId(int id)
        {
            var cover = _editorServices.Covers.GetCoverByCoverLayoutId(id);
            var ret = ToCoverResponse(cover);
            return ret;
        }

        [HttpPost]
        public string SetLayout(CoversModel.Request request)
        {
            var entity = _editorServices.CoverLayouts.GetCoverLayout(request.CoverLayoutId);
            var mergedXml = _editorServices.Pages.MergeElementInfo(request.DocumentXml, entity.TemplateXml);
            var coverColor = entity.Cover.CoverColors.FirstOrDefault();
            var returnXml =  coverColor == null ? mergedXml : Document.ChangeBackgroundImage(mergedXml, coverColor.BackgroundPreview);
            if (request.SavePage)
            {
                var page = new AppCode.SelfPublishing.Page();
                var thumbnail = page.CreateThumbnail(returnXml, request.Url, "jpg");
                _editorServices.Pages.UpdateDocumentXml(returnXml, request.PageId, thumbnail);
            }
            return returnXml;
        }

        [HttpPost]
        public string SetCoverType(CoversModel.Request request)
        {
            try
            {
                _editorServices.Projects.ChangeCover(request.ProjectId, request.CoverId);
                var cover = _editorServices.Covers.GetCoverById(request.CoverId);
                var newRequest = new CoversModel.Request { CoverLayoutId = cover.CoverLayouts.First().CoverLayoutId, DocumentXml = request.DocumentXml, Url = request.Url, PageId = request.PageId, SavePage = true};
                return SetLayout(newRequest);
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "SetCoverType - {0} - {1} - {2}", request.ProjectId, request.CoverId, request.DocumentXml);
                throw;
            }
        }

    }
}