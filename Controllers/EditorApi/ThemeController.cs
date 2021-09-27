using System.Web.Http;
using MyCanvas.Editor.AppCode.Objects;
using MyCanvas.Editor.AppCode.SelfPublishing;
using System.Globalization;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class ThemeController : ApiController
    {

        [HttpGet]
        public Content GetBackgrounds(string width, string height, int partnerId)
        {
	        double.TryParse(width, NumberStyles.Any, CultureInfo.InvariantCulture, out double wResult);
	        double.TryParse(height, NumberStyles.Any, CultureInfo.InvariantCulture, out double hResult);

	        var pageWidth = wResult <= 0 ? 8D : wResult;
	        var pageHeight = hResult <= 0 ? 8D : hResult;

            var theme = new Theme();
            var content = theme.GetBackgrounds(pageWidth, pageHeight, partnerId);

            return content;
        }

    }
}