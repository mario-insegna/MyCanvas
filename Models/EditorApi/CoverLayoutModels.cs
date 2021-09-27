namespace MyCanvas.Editor.Models.EditorApi
{
    public class GetCoverLayoutResponse
    {
        public string TemplateXml { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public string PreviewImageUrl { get; set; }
    }

    public class SaveCoverLayoutRequest
    {
        public int CoverLayoutId { get; set; }
        public string TemplateXml { get; set; }
    }

    public class SaveCoverLayoutThumbnailRequest
    {
        public int CoverLayoutId { get; set; }
        public string Thumbnail { get; set; }
        public string Url { get; set; }
        public string Xml { get; set; }
    }

    public class CoverLayoutModel : GetCoverLayoutResponse
    {
        public int CoverLayoutId { get; set; }
    }
}