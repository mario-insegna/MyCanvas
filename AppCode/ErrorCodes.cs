using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

namespace MyCanvas.Editor.AppCode
{
    internal abstract class ErrorCodes
    {
        internal const string GeneralError = "00.00.00";
        internal const string ImageBadLogin = "03.00.01";
    }

    internal abstract class MiscErrorCodes
    {
        internal const string GeneralError = "00.00.00";
        internal const string BadAuth = "01.01.01";
    }

    internal abstract class PageErrorCodes
    {
        internal const string Save_Failed = "02.01.01";
        internal const string Save_OutOfSync = "02.01.02";
        internal const string ResyncPage_Failed = "02.02.01";
        internal const string ResyncPage_NotResyncable = "02.02.02";
    }

    internal abstract class RemoteErrorCodes
    {
        internal const string NoImages = "03.00.01";
        internal const string NoSites = "03.00.02";
        internal const string ImportInProgress = "03.00.03";
    }

    internal abstract class UserErrorCodes
    {
        internal const string DuplicateEmail = "dupEmail";
        internal const string DuplicateUsername = "dupUsername";
        internal const string NotLoggedIn = "notLoggedIn";
    }
}
