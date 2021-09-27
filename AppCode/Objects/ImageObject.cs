using System;
using System.Collections.Generic;
using System.Web;
using Enigma.Manager;
using Services.Framework.ComBiz;

namespace MyCanvas.Editor.AppCode.Objects
{
    public class ImageObject
    {
        public string ImageId;
        public string Name;
        public string Url;
        public string ThumbUrl;
        public string PdfUrl;
        public string Date;
        public int Width;
        public int Height;
        public Dictionary<string, string> CustomData;

        /// <summary>
        /// Parameterless constructor needed for serialization.
        /// </summary>
        public ImageObject() { }

        public ImageObject(ComBiz.Client.Library.WebAncestry.ImageInfo image)
        {
            Name = image.Name;
            ImageId = image.ImageId;
            Url = image.Url;
            Width = image.Width;
            Height = image.Height;

            SetUrls();
        }

        public ImageObject(ComBiz.Services.Ancestry.ImageInfo image)
        {
            Name = image.Name;
            ImageId = image.ImageId;
            Url = image.Url;
            Width = image.Width;
            Height = image.Height;

            SetUrls();
        }

        public ImageObject(EImage image)
        {
            Name = image.MetaData.Caption;
            Date = image.CreateDate.ToString("d");
            ImageId = image.Id.ToString();
            Width = image.MetaData.Width;
            Height = image.MetaData.Height;

            SetUrls();
        }

        private void SetUrls()
        {
            // if the image has metadata, lets set the thumbnail size differently
            string maxsize = "xsize=" + Math.Min(100, Width);

            // if the image is portrait switch my max dimention to the Y side
            if (Width < Height)
            {
                maxsize = "ysize=" + Math.Min(100, Height);
            }

            if (Width < 100 && Height < 100)
            {
                maxsize = "";
            }

            if (string.IsNullOrEmpty(Url))
            {
                Url = Utilities.createCosDownloadUrl(ImageId, "", "extra=imgObj&name=" + HttpUtility.UrlEncode(Name), true);
            }
            if (string.IsNullOrEmpty(ThumbUrl))
            {
                ThumbUrl = Utilities.createCosDownloadUrl(ImageId, maxsize, "extra=imgObj&name=" + HttpUtility.UrlEncode(Name), true);
            }
            if (string.IsNullOrEmpty(PdfUrl))
            {
                PdfUrl = Utilities.createCosDownloadUrl(ImageId, "export=Pdf", "extra=imgObj&name=" + HttpUtility.UrlEncode(Name), true);
            }
        }
    }
}