using System;
using System.Web;
using ComBiz.Services.Ancestry;
using Services.Framework.ComBiz;

namespace MyCanvas.Editor.AppCode.Objects
{
    /// <summary>
    /// Wrapper class for WebAncestry.RecordInfo that hides unwanted fields.
    /// </summary>
    [Serializable]
    public class Record
    {
        public string Id;
        public int DatabaseId;
        public int IconId;
        public int Height;
        public int Width;
        public string Name;
        public string DisplayName;
        public string Url;
        public string Text;
        public bool AllowAccess;
        public string SourceTagString;

        /// <summary>
        /// Parameterless constructor needed for serialization.
        /// </summary>
        public Record() { }

        /// <summary>
        /// Initializes a new instance of the <see cref="RecordInfo"/> class.
        /// </summary>
        /// <param name="record">The record.</param>
        public Record( RecordInfo record )
        {
            this.Id = record.Id;
            this.DatabaseId = record.DatabaseId;
            this.Name = record.Name;
            this.Height = record.Height;
            this.Width = record.Width;
            this.IconId = record.IconId;
			this.DisplayName = record.DisplayName;
            this.Url = record.Url;
            this.AllowAccess = record.AllowAccess;
            this.Text = record.Text;
            this.SourceTagString = record.SourceTagString;

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

            //if (string.IsNullOrEmpty(Url))
            //{
            //    Url = Utilities.createCosDownloadUrl(ImageId, "", "extra=imgObj&name=" + HttpUtility.UrlEncode(Name), true);
            //}
            //if (string.IsNullOrEmpty(ThumbUrl))
            //{
            //    ThumbUrl = Utilities.createCosDownloadUrl(ImageId, maxsize, "extra=imgObj&name=" + HttpUtility.UrlEncode(Name), true);
            //}
            //if (string.IsNullOrEmpty(PdfUrl))
            //{
            //    PdfUrl = Utilities.createCosDownloadUrl(ImageId, "export=Pdf", "extra=imgObj&name=" + HttpUtility.UrlEncode(Name), true);
            //}
        }
    }
}