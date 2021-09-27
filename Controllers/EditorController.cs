using System;
using System.Linq;
using System.Web.Mvc;
using MyCanvas.Editor.AppCode;
using Serilog;
using Services.Framework.ComBiz;

namespace MyCanvas.Editor.Controllers
{
    [Authorize]
    public class EditorController : Controller
    {

        #region Pdf/Png

        [HttpPost]
        public JsonResult CreateFilePathByXml(string xml, string url, string format)
        {
	        var parsedXml = xml.Replace("localmycanvas", "devmycanvas");
            try
			{
                if (string.IsNullOrEmpty(xml)) return Json(new { path = "" });

                var ret = Common.ChiliServiceByUrl(url).DocumentCreateTempFile(format, parsedXml, 0);
                return Json(new { path = ret.Url });
            }
            catch (Exception ex)
            {
                var errorMessage = $"Error in CreateFilePathByXml. xml={parsedXml} - url={url} - format={format} ";
                Log.Error(ex, errorMessage);
                throw new Exception(errorMessage, ex);
            }
        }

        [HttpGet]
        public FileResult GetFileByPath(string path, string file)
        {
            var stream = Common.GetStreamFromUrl(path);
            var data = path.EndsWith(".zip") ? Utilities.GetZippedFileEntry(stream) : stream.ToArray();
            return File(data, System.Net.Mime.MediaTypeNames.Application.Octet, file);
        }

        #endregion

    }
}
