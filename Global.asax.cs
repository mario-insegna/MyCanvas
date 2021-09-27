using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using System.Web.Optimization;
using Enigma.Content;
using Enigma.Manager;

namespace MyCanvas.Editor
{
    public class Global : HttpApplication
    {

        private static ContentService s_contentService;

        internal static ContentService ContentService
        {
            get
            {
                if (s_contentService == null) s_contentService = new ContentService();
                return s_contentService;
            }
        }

        internal static EManager EnigmaManager
        {
            get
            {
                return ContentService.Manager;
            }
        }

        void Application_Start(object sender, EventArgs e)
        {
            SqlServerTypes.Utilities.LoadNativeAssemblies(Server.MapPath("~/bin"));
            // Code that runs on application startup
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
        }

    }
}