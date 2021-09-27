using System.Collections;
using MyCanvas.ProjectData;

namespace MyCanvas.Editor.Models.EditorApi
{
    public class GetThumbnailRequest
    {
        public string Xml { get; set; }
        public string Url { get; set; }
        public string Format { get; set; }
    }

    public class SaveProjectRequest
    {
        public DocumentRequest[] Data { get; set; }
        public long ProjectId { get; set; }
        public long PageId { get; set; }
        public string Url { get; set; }
    }

    public class AddPagesRequest
    {
        public int ProductId { get; set; }
        public long ProjectId { get; set; }
	    public string Url { get; set; }
        public string PersonId { get; set; }
        public string TreeId { get; set; }
        public LayoutTypes LayoutTypeId { get; set; }
        public string SpouseId { get; set; }
        public int LayoutId { get; set; }
        public int ThemeId { get; set; }
        public int PageNumber { get; set; }
        public int? NumGenerations { get; set; }
        public int[] LayoutTypesToSkip { get; set; }
        public string[] EventIds { get; set; }
        public string[] RecordIds { get; set; }
	}

    public class UpdatePagesRequest
    {
        public int ProductId { get; set; }
        public long ProjectId { get; set; }
        public long PageId { get; set; }
        public int PageNumber { get; set; }
        public long[] PageIds { get; set; }
        public int[] LayoutIds { get; set; }
    }

    public class BuildNewProjectRequest
    {
        public string Name { get; set; }
        public int ProductId { get; set; }
        public int ThemeId { get; set; }
        public Hashtable CustomData { get; set; }
    }

    public class GetProjectPagesResponse
    {
        public GetLayoutResponse Layout { get; set; }
        public int PageNumber { get; set; }
        public long PageId { get; set; }
        public string ThumnailUrl { get; set; }
}

    public class DocumentRequest
    {
        // ReSharper disable InconsistentNaming
        // This class is mapped with ICache interface from CacheManager component
        public int Key { get; set; }
        public string Data { get; set; }
        public string Thumbnail { get; set; }

    }
}