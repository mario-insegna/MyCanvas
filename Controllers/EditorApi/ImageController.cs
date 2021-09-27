using System.Collections.Generic;
using System.Net;
using System.Web.Http;
using System.Web.Mvc;
using MyCanvas.Editor.AppCode.Objects;
using MyCanvas.Editor.AppCode.SelfPublishing;
using MyCanvas.Editor.Models.EditorApi;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class ImageController : ApiController
    {

        [System.Web.Http.HttpGet]
        public PhotoContent GetAllImages()
        {
            Image image = new Image();
            PhotoContent photoContent = image.GetAllImages();

            return photoContent;
        }

        [System.Web.Http.HttpPost]
        public PhotoContent CreateAlbum(CreateAlbumRequest req)
        {
            Image image = new Image();
            PhotoContent photoContent = image.CreateAlbum(req.Name);

            return photoContent;
        }

        [System.Web.Http.HttpPost]
        public bool DeleteAlbum(DeleteAlbumRequest req)
        {
            Image image = new Image();
            image.DeleteAlbum(req.Id);

            return true;
        }


        [System.Web.Http.HttpPost]
        public HttpStatusCodeResult DeleteImages(DeleteImageRequest req)
        {
            try
            {
                Image image = new Image();
                var message = image.DeleteImages(req.Ids);
                return new HttpStatusCodeResult(HttpStatusCode.OK, message);
            }
            catch (System.Exception ex)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest, ex.Message);
            }
        }

        [System.Web.Http.HttpGet]
        public Content GetCategory(long Id, string type)
        {
            Content content = Image.GetCategory(Id, type);

            return content;
        }

        [System.Web.Http.HttpGet]
        public Embellishment[] GetImages(long categoryId, string searchString, string type)
        {
            Image image = new Image();
            Embellishment[] embellishmentList = image.GetImages(categoryId, searchString, type);

            return embellishmentList;
        }

        [System.Web.Http.HttpGet]
        public List<ProjectData.ImageUsage> GetImageUsage(long projectId)
        {
            Image image = new Image();
            List<ProjectData.ImageUsage> imageUsageList = image.GetImageUsage(projectId);

            return imageUsageList;
        }

        [System.Web.Http.HttpGet]
        public Content GetAllContent(int partnerId)
        {
            Image image = new Image();
            Content content = image.GetAllContent(partnerId);

            return content;
        }

    }
}