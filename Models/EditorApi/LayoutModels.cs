namespace MyCanvas.Editor.Models.EditorApi
{
    public class GetLayoutResponse
    {
        public string TemplateXml { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public string PreviewImageUrl { get; set; }
    }

    public class SaveLayoutRequest
    {
        public int LayoutId { get; set; }
        public string TemplateXml { get; set; }
    }

    public class SaveLayoutThumbnailRequest
    {
        public int LayoutId { get; set; }
        public string Thumbnail { get; set; }
        public string Url { get; set; }
        public string Xml { get; set; }
    }
}