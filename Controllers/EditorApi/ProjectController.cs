using ComBiz.Services.Editor;
using Enigma.Manager;
using MyCanvas.Editor.AppCode;
using MyCanvas.Editor.Models.EditorApi;
using MyCanvas.ProjectData;
using Services.Framework.ComBiz;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web.Http;
using System.Web.Mvc;
using LZStringCSharp;
using Serilog;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class ProjectController : ApiController
    {
	    private static readonly ILogger Logger = ComBiz.Services.Common.Log.ForContext<ProjectController>();
		private readonly EditorServices EditorServices;
        public static readonly EManager EnigmaManager = new EManager();
        private const int LimitOfCalls = 500;
	    private const string UnauthorizedError = "Unauthorized access.";


		public ProjectController()
        {
            EditorServices = new EditorServices();
        }

        [System.Web.Http.HttpPost]
        public HttpStatusCodeResult SaveProject(SaveProjectRequest req)
        {
	        if (!User.Identity.IsAuthenticated)
	        {
		        Logger.Error("Error in SaveProject {ProjectId} - {errorMessage} ", req.ProjectId, UnauthorizedError);
				return new HttpStatusCodeResult(HttpStatusCode.Unauthorized, UnauthorizedError);
			}
			try
	        {
	            var appCodePage = new AppCode.SelfPublishing.Page();

				foreach (var d in req.Data.ToList())
				{
				    var xml = LZString.DecompressFromEncodedURIComponent(d.Data);

				    if (d.Key == req.PageId)
				    {
				        d.Thumbnail = appCodePage.CreateThumbnail(xml, req.Url, "jpg");
				    }

					if (!Utilities.ValidateXml(xml, out string errorMessage))
					{
						Logger.Error("Error in ValidateXml {ProjectId} - {errorMessage} ", req.ProjectId, errorMessage);
						return new HttpStatusCodeResult((HttpStatusCode)Utilities.WebdavStatusCode.UnprocessableEntity, errorMessage);
					}

					var page = EditorServices.Pages.UpdateDocumentXml(xml, d.Key, d.Thumbnail);
			        if (page.Sequence == 1)
			        {
				        EditorServices.Projects.SaveProjectThumbnail(page.ThumbnailId, req.ProjectId);
			        }
		        }
		        return new HttpStatusCodeResult(HttpStatusCode.OK, "Project saved");
			}
			catch (Exception ex)
	        {
		        Logger.Error(ex, "Error in SaveProject - ProjectId={ProjectId} ", req.ProjectId);
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest, ex.Message);
			}
        }

        [System.Web.Http.HttpGet]
        public string GetDocumentXmlById(int pageId)
        {
            var xml = EditorServices.Pages.GetDocumentXml(pageId);

			return LZString.CompressToEncodedURIComponent(xml);
        }

        [System.Web.Http.HttpGet]
        public List<GetProjectPagesResponse> GetProjectPages(int projectId)
        {
            var project = EditorServices.Projects.GetProject(projectId);
	        var pages = EditorServices.Pages.GetPages(project);
            var projectProduct = project?.Product?.ProductType;
            var filteredPages = projectProduct?.ProductTypeGroupId == ProductTypeGroups.PhotoPosters || projectProduct?.ProductTypeGroupId == ProductTypeGroups.FamilyHistoryPosters ? pages.Where(x => x.Sequence == 0) : pages;
			var finalPages = filteredPages.Select(x =>
            {
                Guid? guid = x.ThumbnailId ?? x.Layout.PreviewImage;
                var seq = x?.Sequence ?? -1;
                EObject obj = guid.HasValue ? (!guid.Value.Equals(Guid.Empty) ? EnigmaManager.Fetch(guid.Value) : null) : null;
                return new GetProjectPagesResponse()
                {
                    Layout = new GetLayoutResponse()
                    {
                        Width = x.Layout.Product.Width,
                        Height = x.Layout.Product.Height
                    },
                    PageNumber = x.Sequence,
                    PageId = x.PageId,
                    ThumnailUrl = obj != null ? Utilities.createCosDownloadUrl(obj.Id, $"xsize={(seq == 0 ? "144" : "72")}&cache=no").Replace("localmycanvas", "devmycanvas") : string.Empty
                };
            }).OrderBy(p=> p.PageNumber);

            return finalPages.ToList();
        }

        [System.Web.Http.HttpPost]
        public System.Web.Mvc.EmptyResult UpdateProjectPages(UpdatePagesRequest req)
        {
            EditorServices.Pages.UpdatePagesSequence(req.ProjectId, req.PageId, req.PageNumber);
            return new System.Web.Mvc.EmptyResult();
        }

        [System.Web.Http.HttpPost]
        public long BuildNewProject(BuildNewProjectRequest req)
        {
            try
            {
                // TODO: DAN - implement sending the customer their welcome email
                //if( !Common.SelfPublishing.HasAnyProjectsByUserId( Common.UserId ) && Common.IsAuthenticated )
                //{
                //    ////User.UcdmProvider.SendCustomersFirstEmail( partnerId, Common.User );
                //}

                // Save custom data as string
                if (req.CustomData == null)
                {
                    req.CustomData = new Hashtable();
                }
                
                // TODO: danielh: Is this param ever used?
                req.CustomData["pageNumberVisible"] = true;

                // TODO: danielh: Apparently calendar events are not used in old flex app, do we need this?
                //if (req.CustomData.ContainsKey(Constants.CalendarEvents))
                //{
                //    // We need to turn CalendarEventObjects back to CalendarEvents, but since they will be serialized in a hashtable and not
                //    // passed as a regular parameter we have to use the shared code version of the class, not the webservice proxy.
                //    Object[] calendarEventObjects = (Object[])customData[Constants.CalendarEvents];
                //    List<SharedCalendar.CalendarEvent> calendarEvents = new List<SharedCalendar.CalendarEvent>();
                //    foreach (CalendarEventObject ceo in calendarEventObjects)
                //    {
                //        calendarEvents.Add(ceo.GetCalendarEvent());
                //    }
                    
                //    customData[Constants.CalendarEvents] = calendarEvents;
                //}

                string customDataString = Utilities.HashtableToJson(req.CustomData);
                var ancestryToken = Common.GetAncestryToken();
                var project = EditorServices.Projects.AddProject(ancestryToken,req.Name, req.ThemeId, req.ProductId, Common.UserId, customDataString);
                Common.Editor.CreateProjectPages_Async(ancestryToken, project.ProjectId, req.ProductId, project.ThemeId, customDataString);

                return project.ProjectId;
            }
            catch (Exception ex)
            {
                throw Common.ChooseException(ex, null);
            }
        }

        [System.Web.Http.HttpGet]
        public bool CheckForProject(int projectId, int counter)
        {
	        Thread.Sleep(750);
			var active = EditorServices.Projects.CheckForProject(projectId);
            if (counter > LimitOfCalls) throw new Exception("CheckForProject has reached the limit of calls.");

            return active;
        }
    }
}
