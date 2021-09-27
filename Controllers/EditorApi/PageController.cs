using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using Services.Framework.ComBiz.Editor.SourceTags;
using ComBiz.Services.Editor;
using Enigma.Manager;
using MyCanvas.Editor.Models.EditorApi;
using MyCanvas.Editor.AppCode;
using MyCanvas.ProjectData;
using Serilog;
using Services.Framework.ComBiz;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class PageController : ApiController
    {
		private static readonly ILogger Logger = ComBiz.Services.Common.Log.ForContext<PageController>();
        private readonly EditorServices _editorServices;
        private readonly ProjectController _projectController;
        private readonly AppCode.SelfPublishing.Page Page;

        public static readonly EManager EnigmaManager = new EManager();

        public PageController()
        {
            _editorServices = new EditorServices();
            _projectController = new ProjectController();
            Page = new AppCode.SelfPublishing.Page();
        }

        [HttpPost]
        public Hashtable ResyncImageElement(AssetMetadata assetMetadata)
        {
            Hashtable result = Page.ResyncImageElement(assetMetadata.SourceInfo, assetMetadata.ClientInfo.Index);
            return result;
        }

        [HttpPost]
        public Hashtable ResyncTextElement(AssetMetadata assetMetadata)
        {
            Hashtable result = Page.ResyncTextElement(assetMetadata.SourceInfo);
            return result;
        }

        [HttpPost]
        public List<FrameElementModel> ResyncAllElements(Dictionary<object, AssetMetadata> assetMetadata)
        {
            return Page.ResyncAllElements(assetMetadata);
        }


        [HttpPost]
        public List<GetProjectPagesResponse> DeletePages(UpdatePagesRequest req)
        {
            try
            {
                _editorServices.Pages.DeletePages(req.PageIds, req.ProjectId);
                return _projectController.GetProjectPages((int)req.ProjectId);
            }
            catch (Exception ex)
            {
	            Logger.Error(ex, "Error in DeletePages - ProjectId={0} - PageIds={1} ", req.ProjectId, string.Join(",", req.PageIds));
                throw;
            }
        }

        [HttpPost]
        public List<GetProjectPagesResponse> AddPages(UpdatePagesRequest req)
        {
            try
            {
                var product = _editorServices.Products.GetProduct(req.ProductId);
                if (req.LayoutIds == null)
                {
                    var idLayout = product.DefaultLayoutId ?? _editorServices.Layouts.GetDefault().LayoutId;
                    req.LayoutIds = new int[1];
                    req.LayoutIds[0] = idLayout;
                }
                var list = new List<Page>();
                // ReSharper disable once LoopCanBeConvertedToQuery
                foreach (var layout in req.LayoutIds)
                {
                    var page = new Page
                    {
                        ProjectId = req.ProjectId,
                        LayoutId = layout,
                        Layout = _editorServices.Layouts.GetLayout(layout),
                        Height = product.Height,
                        Width = product.Width,
                        Sequence = req.PageNumber
                    };
                    list.Add(page);
                }                                           
                _editorServices.Pages.AddPages(list);
                return _projectController.GetProjectPages((int)req.ProjectId);
            }
            catch (Exception ex)
            {
                Logger.Error(ex, "Error in AddPages - ProjectId={0} - ProductId={1} - PageNumber={2} ", req.ProjectId, req.ProductId, req.PageNumber);
                throw;
            }
        }

        [HttpPost]
        public List<GetProjectPagesResponse> NewPagesFromTree(AddPagesRequest req)
        {
            var customData = new Hashtable();
            if (req.TreeId != null) customData[Constants.Param_TreeId] = req.TreeId;
            if (req.PersonId != null) customData[Constants.Param_PersonId] = req.PersonId;
            if (req.SpouseId != null) customData[Constants.Param_SpouseId] = req.SpouseId;
            if (req.EventIds != null) customData[Constants.Param_EventIds] = req.EventIds;
            if (req.RecordIds != null) customData[Constants.Param_RecordIds] = req.RecordIds;
            if (req.LayoutTypesToSkip != null) customData[Constants.Param_LayoutTypesToSkip] = req.LayoutTypesToSkip;
            if (req.NumGenerations != null) customData[Constants.Param_NumGenerations] = req.NumGenerations;

	        var page = new AppCode.SelfPublishing.Page();

            var pages = req.LayoutTypeId == LayoutTypes.Tree 
	            ? page.NewPagesFromTree(req.ProjectId, req.LayoutId, req.ProductId, req.ThemeId, req.PageNumber, customData, null).ToList() 
	            : page.NewPage(req.ProjectId, req.LayoutId, req.ThemeId, req.PageNumber, customData);

			// save thumbnails
	        foreach (var pag in pages)
	        {
		        page.SavePageThumbnail((int) pag.PageId, req.Url, "jpg");
	        }
			return _projectController.GetProjectPages((int)req.ProjectId);
        }

        [HttpGet]
        public string GetThumbnailUrl(int id)
        {
            var page = _editorServices.Pages.GetPage(id);
            var guid = page?.ThumbnailId ?? Guid.Empty;
            var seq = page?.Sequence ?? -1;
            var obj = !guid.Equals(Guid.Empty) ? EnigmaManager.Fetch(guid) : null;
            return obj != null ? Utilities.createCosDownloadUrl(obj.Id, $"xsize={(seq == 0 ? "144" : "72")}&cache=no").Replace("localmycanvas", "devmycanvas") : string.Empty;
        }
	}
}
