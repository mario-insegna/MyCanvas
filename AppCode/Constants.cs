namespace MyCanvas.Editor.AppCode
{
    internal class Constants
    {
        internal const string Background = "background";
        internal const string ProjectWidth = "ProjectWidth";
        internal const string ProjectHeight = "ProjectHeight";
        internal const string CropTop = "CropTop";
        internal const string CropBottom = "CropBottom";
        internal const string CropLeft = "CropLeft";
        internal const string CropRight = "CropRight";
        internal const string CalendarEvents = "calendarEvents";

        // Constants for mini viewer get image calls
        internal const string PageId = "pageid";
        internal const string PageIdSymbol = "!$$#"; // used to surround the pageid with in the encrypted string
        internal const string FrontCover = "frontCover";
        internal const string BackCover = "backCover";
        internal const string AspectRatio = "aspectRatio";

        internal const string SortOrder = "SortOrder";

        internal const string Param_TreeId = "treeid";
        internal const string Param_PersonId = "personid";
        internal const string Param_SpouseId = "spouseid";
        internal const string Param_EventIds = "events";
        internal const string Param_RecordId = "recordid";
        internal const string Param_RecordIds = "recordids";
        internal const string Param_DatabaseId = "dbid";
        internal const string Param_ImageId = "iid";
        internal const string Param_BackgroundId = "backgroundId";
        internal const string Param_BackgroundColor = "backgroundColor";
        internal const string Param_Enhance = "enhance";
        internal const string Param_CalendarMonth = "calendarMonth";
        internal const string Param_LayoutTypesToSkip = "layouttypestoskip";
        internal const string Param_NumGenerations = "NUM_GENERATIONS";

        internal const string NO_BACKGROUND_GUID = "11111111-1111-1111-1111-111111111111";

        internal const int DPI = 72;

        // Used for the SiteId of a Content for user-uploaded images and the Id of user-uploaded backgrounds
        internal const int MY_COMPUTER_TYPE_ID = -1;
    }
}