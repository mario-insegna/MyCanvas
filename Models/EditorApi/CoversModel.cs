using System.Collections.Generic;
using MyCanvas.ProjectData;

namespace MyCanvas.Editor.Models.EditorApi
{
    public class CoversModel
    {
        public class Request
        {
            public int CoverLayoutId { get; set; }
            public int ProjectId { get; set; }
            public int CoverId { get; set; }
            public string DocumentXml { get; set; }
            public string Url { get; set; }
            public int PageId { get; set; }
            public bool SavePage { get; set; }
        }

        public class Response
        {
            public int CoverId { get; set; }
            public CoverTypes CoverTypeId { get; set; }
            public string Name { get; set; }
            public string DisplayName { get; set; }
            public string Sku { get; set; }
            public int MaxPages { get; set; }
            public int MinPages { get; set; }
            public int CountPages { get; set; }
            public string Binding { get; set; }
            public decimal BasePrice { get; set; }
            public decimal PagePrice { get; set; }
            public decimal TotalCost { get; set; }
            public List<GetCoverLayoutResponse> Layouts { get; set; }
            public List<CoverColorsModel.Response> Colors { get; set; }
        }

    }
}