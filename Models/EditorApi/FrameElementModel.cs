using MyCanvas.Editor.AppCode.Objects;

namespace MyCanvas.Editor.Models.EditorApi
{
    public class FrameElementModel
    {
        public object FrameId { get; set; }
        public string TextElement { get; set; }
        public ImageObject ImageElement { get; set; }
        public bool Problems { get; set; }
    }
}