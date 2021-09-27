using ComBiz.Services.Editor;
using System.Web.Http;
using MyCanvas.Editor.Models.EditorApi;
using Services.Framework.ComBiz.Editor;
using System;
using Enigma.Manager;
using Services.Framework.ComBiz;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class CoverLayoutController : ApiController
    {

        private readonly EditorServices EditorServices;

        public static readonly EManager EnigmaManager = new EManager();

        public CoverLayoutController()
        {
            EditorServices = new EditorServices();
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public GetCoverLayoutResponse GetCoverLayout(int coverLayoutId)
        {
            var coverLayout = EditorServices.CoverLayouts.GetCoverLayout(coverLayoutId);
            var previewImageUrl = EditorServices.CoverLayouts.GetCoverLayoutThumbnailUrl(coverLayout.PreviewImage);

            return new GetCoverLayoutResponse()
            {
                TemplateXml = Document.ValidateTemplateXml(coverLayout.TemplateXml),
                Width = coverLayout.Cover.Width,
                Height = coverLayout.Cover.Height,
                PreviewImageUrl = previewImageUrl
            };
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public string SaveCoverLayout(SaveCoverLayoutRequest req)
        {
            EditorServices.CoverLayouts.SaveCoverLayoutTemplateXml(req.CoverLayoutId, req.TemplateXml);

            return "Cover Layout Saved";
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public bool SaveCoverLayoutThumbnail(SaveCoverLayoutThumbnailRequest req)
        {
            var appCodePage = new AppCode.SelfPublishing.Page();
            req.Thumbnail = appCodePage.CreateThumbnail(req.Xml, req.Url, "jpg");

            EditorServices.CoverLayouts.SaveCoverLayoutThumbnail(req.CoverLayoutId, req.Thumbnail);

            return true;
        }

        [HttpGet]
        public string GetThumbnailUrl(int id)
        {
            var coverlayout = EditorServices.CoverLayouts.GetCoverLayout(id);
            var guid = coverlayout != null ? coverlayout.PreviewImage : Guid.Empty;
            var obj = guid.HasValue ? (!guid.Value.Equals(Guid.Empty) ? EnigmaManager.Fetch(guid.Value) : null) : null;
            return obj != null ? Utilities.createCosDownloadUrl(obj.Id, "xsize=72&cache=no").Replace("localmycanvas", "devmycanvas") : string.Empty;
        }

    }
}