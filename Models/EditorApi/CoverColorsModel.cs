using MyCanvas.Editor.AppCode.Objects;

namespace MyCanvas.Editor.Models.EditorApi
{
    public class CoverColorsModel
    {
        public class Response
        {
            public int CoverColorId { get; set; }
            public string DisplayName { get; set; }
            public string CoverPageInsidePreview { get; set; }
            public string CoverPageOutsidePreview { get; set; }
            public string TextColor { get; set; }
            public ImageObject ColorPreview { get; set; }
        }
    }
}