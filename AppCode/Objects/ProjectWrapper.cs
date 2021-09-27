using System.Collections;
using MyCanvas.ProjectData;

namespace MyCanvas.Editor.AppCode.Objects
{
    public class ProjectWrapper
    {
        public ProjectUrls ProjectUrls { get; set; }
        public ProjectParameters ProjectParameters { get; set; }
    }

    public class ProjectUrls
    {
        public string RootUrl { get; set; }
        public string EditorUrl { get; set; }
        public string PwsUrl { get; set; }
    }
    public class ProjectParameters
    {
        public string Name { get; set; }
        public ApplicationModes Mode { get; set; }
        public long? ProjectId { get; set; }
        public int? ProductId { get; set; }
        public int? ThemeId { get; set; }
        public int? PartnerId { get; set; }
        public int? Preview { get; set; }
        public int? LayoutId { get; set; }
		public int? CoverLayoutId { get; set; }
        public Hashtable CustomData { get; set; }
	    public ProductTypeGroups? ProductTypeGroupId { get; set; }
        public string Editor_Workspaceid { get; set; }
    }

	public enum ApplicationModes
    {
        PROJECT_PREVIEW,
        PROJECT_EDITING,
        PROJECT_EDITING_ADMIN,
        LAYOUT_EDITING,
        COVER_LAYOUT_EDITING
    }
}