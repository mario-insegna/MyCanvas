using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using Chili.Services;
using ComBiz.Services.Editor;
using MyCanvas.Editor.AppCode;
using MyCanvas.Editor.AppCode.Objects;

namespace MyCanvas.Editor.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        #region Private

        private static readonly string Service_environmentNameOrURL = Common.GetAppSetting<string>("Service_environmentNameOrURL");
        private static readonly string Service_userName = Common.GetAppSetting<string>("Service_userName");
        private static readonly string Service_password = Common.GetAppSetting<string>("Service_password");
        private static readonly string Service_applicationName = Common.GetAppSetting<string>("Service_applicationName");
        private static readonly string Editor_Workspaceid = Common.GetAppSetting<string>("Editor_Workspaceid");

		private readonly EditorServices EditorServices = new EditorServices();

		#endregion Private

		// GET: Login
		[AllowAnonymous]
        public ActionResult Login(string ReturnUrl)
        {
            string absoluteReturnUrl = $"{Request.Url.Scheme}://{Request.Url.Host}{ReturnUrl}";

            return Redirect($"{Request.Url.Scheme}://{Request.Url.Host.Replace("editor.", "www.")}/Account/Login.aspx?returnUrl={Url.Encode(absoluteReturnUrl)}");
        }

        // GET: Home
        public ActionResult Index(int? fp, int? preview)
        {
	        if (!fp.HasValue) return new EmptyResult();

			var previewMode = preview.HasValue && preview.Value == 1;
	        var project =  EditorServices.Projects.GetProject(fp.Value);

            if (!project.Active) return new EmptyResult();

            var model = new ProjectWrapper
            {
                ProjectUrls = BuildProjectUrls(),
                ProjectParameters = new ProjectParameters()
                {
                    Mode = previewMode ? ApplicationModes.PROJECT_PREVIEW : (User.IsInRole("SuperAdmin")
                        ? ApplicationModes.PROJECT_EDITING_ADMIN
                        : ApplicationModes.PROJECT_EDITING),
                    ProjectId = project.ProjectId,
                    ProductId = project?.ProductId,
                    ThemeId = project?.ThemeId,
                    Preview = preview ?? 0,
                    PartnerId = Common.User.PartnerId,
					ProductTypeGroupId = project?.Product?.ProductType?.ProductTypeGroupId,
                    Editor_Workspaceid = Editor_Workspaceid,
	                CustomData = new Hashtable(new Dictionary<string, string> {
		                { "Width", project?.Product?.Width.ToString(CultureInfo.InvariantCulture) } ,
		                { "Height", project?.Product?.Height.ToString(CultureInfo.InvariantCulture) }  })
				},
            };

            return View(model);
        }

        [Authorize(Roles = "SuperAdmin")]
        public ActionResult EditLayoutTemplate(int id)
        {
	        var layout = EditorServices.Layouts.GetLayout(id);
            var model = new ProjectWrapper
            {
                ProjectUrls = BuildProjectUrls(),
                ProjectParameters = new ProjectParameters()
                {
                    Mode = ApplicationModes.LAYOUT_EDITING,
                    LayoutId = id,
                    Editor_Workspaceid = Editor_Workspaceid,
                    CustomData = new Hashtable(new Dictionary<string, string> {
		                { "Width", layout?.Product?.Width.ToString(CultureInfo.InvariantCulture) } ,
		                { "Height", layout?.Product?.Height.ToString(CultureInfo.InvariantCulture) }  })
				},
            };

            return View("~/Views/Home/Index.cshtml", model);
        }

        [Authorize(Roles = "SuperAdmin")]
        public ActionResult EditCoverLayoutTemplate(int id)
        {
	        var coverLayout = EditorServices.CoverLayouts.GetCoverLayout(id);
			var model = new ProjectWrapper
            {
                ProjectUrls = BuildProjectUrls(),
                ProjectParameters = new ProjectParameters()
                {
                    Mode = ApplicationModes.COVER_LAYOUT_EDITING,
                    CoverLayoutId = id,
                    Editor_Workspaceid = Editor_Workspaceid,
                    CustomData = new Hashtable(new Dictionary<string, string> {
		                { "Width", coverLayout?.Cover?.Width.ToString(CultureInfo.InvariantCulture) } ,
		                { "Height", coverLayout?.Cover?.Height.ToString(CultureInfo.InvariantCulture) }  })
				},
            };

            return View("~/Views/Home/Index.cshtml", model);
        }

        public ActionResult NewProject(string name, int productid, int themeid, string customdata = null)
        {
            Hashtable customData = null;
            if (!string.IsNullOrEmpty(customdata))
            {
                JavaScriptSerializer ser = new JavaScriptSerializer();
                customData = ser.Deserialize<Hashtable>(customdata);
            }

            var model = new ProjectWrapper
            {
                ProjectUrls = BuildProjectUrls(),
                ProjectParameters = new ProjectParameters()
                {
                    Name = name,
                    Mode = ApplicationModes.PROJECT_EDITING,
                    ProjectId = 0,
                    ProductId = productid,
                    ThemeId = themeid,
                    Preview = 0,
                    Editor_Workspaceid = Editor_Workspaceid,
                    CustomData = customData
                },
            };

            return View("~/Views/Home/NewProject.cshtml", model);
        }

        private ProjectUrls BuildProjectUrls()
        {
            var chiliService = new Service(Service_environmentNameOrURL, Service_userName, Service_password);
            var htmlEditor = chiliService.DocumentGetHtmlEditorUrl(string.Empty, string.Empty, string.Empty, string.Empty, false, false);

            var rootUrl = $"{Request.Url.Scheme}://{Request.Url.Host}";
	        var relativeUrl = htmlEditor.RelativeUrl.TrimStart('/');
			var editorUrl = $"{rootUrl}/{Service_applicationName}/{relativeUrl}&fullWS=false";
            var pwsUrl = $"{Request.Url.Scheme}://{Request.Url.Host.Replace("editor.", "pws.")}";

            return new ProjectUrls()
            {
                RootUrl = rootUrl,
                EditorUrl = editorUrl,
                PwsUrl = pwsUrl
            };
        }

    }
}