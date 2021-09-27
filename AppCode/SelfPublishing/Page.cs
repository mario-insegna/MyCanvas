using System;
using System.Collections;
using System.Collections.Generic;
using ComBiz.Services.Ancestry;
using ComBiz.Services.Editor;
using ElementInfo = Services.Framework.ComBiz.Editor.ElementInfo;
using MyCanvas.Editor.AppCode.Objects;
using MyCanvas.Editor.Models.EditorApi;
using Services.Framework.Logging;
using Serilog;
using Services;
using Services.Framework.ComBiz.Editor.SourceTags;
using Services.Framework.ComBiz;
using Services.Framework.Storage;

namespace MyCanvas.Editor.AppCode.SelfPublishing
{
    public class Page
    {
        private static readonly ILogger Log = LogFactory.Logger.ForContext<Page>();
        private readonly EditorServices _editorServices;
	    private readonly IAzureBlobStorage _azureBlobStorage =
		    new AzureBlobStorage(
			    MyCanvasServices.GetStorageConnection(MyCanvasServices.StorageConnections.PageElements),
			    MyCanvasServices.GetStorageContainer(MyCanvasServices.StorageConnections.Editor));

		public Page()
        {
            _editorServices = new EditorServices();
        }

        public Hashtable ResyncImageElement(SourceInfo sourceInfo, string index)
        {
            try
            {
                bool hadProblems = false;
                ImageInfo newValue = null;

                try
                {
                    newValue = _editorServices.Pages.ResyncImageElement(Common.GetAncestryToken(), sourceInfo, index);
                }
                catch (Exception ex)
                {
                    Log.Warning(ex, "Warning for ResyncImageElement. sourceInfo={sourceInfo},", sourceInfo);
                    hadProblems = true;
                }

                Hashtable result = new Hashtable();
                result["problems"] = hadProblems;
                result["result"] = newValue != null ? new ImageObject(newValue) : null;
                return result;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in ResyncImageElement. sourceInfo={sourceInfo},", sourceInfo);
                throw Common.ChooseException(ex, null);
            }
        }
        public Hashtable ResyncTextElement(SourceInfo sourceInfo)
        {
            try
            {
                bool hadProblems = false;
                string newValue = null;

                try
                {
                    newValue = _editorServices.Pages.ResyncTextElement(Common.GetAncestryToken(), sourceInfo);
                }
                catch (Exception ex)
                {
                    Log.Warning(ex, "Warning for ResyncTextElement. sourceInfo={sourceInfo},", sourceInfo);
                    hadProblems = true;
                }

                Hashtable result = new Hashtable();
                result["problems"] = hadProblems;
                result["result"] = newValue;
                return result;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in ResyncTextElement. sourceInfo={sourceInfo},", sourceInfo);
                throw Common.ChooseException(ex, null);
            }
        }
        public List<FrameElementModel> ResyncAllElements(Dictionary<object, AssetMetadata> assetMetadata)
        {
            try
            {
                var list = new List<FrameElementModel>();
                foreach (var element in assetMetadata)
                {
                    var hadProblems = false;
                    var elementModel = new FrameElementModel();
                    try
                    {
                        if (element.Value.SourceInfo.Type == TagType.Image ||
                            element.Value.SourceInfo.Type == TagType.ImagePerson ||
                            element.Value.SourceInfo.Type == TagType.Record)
                        {
                            var newvalue = _editorServices.Pages.ResyncImageElement(Common.GetAncestryToken(),
                                element.Value.SourceInfo, element.Value.ClientInfo.Index);
                            elementModel.ImageElement = newvalue != null ? new ImageObject(newvalue) : null;
                        }
                        else
                        {
                            elementModel.TextElement =
	                            _editorServices.Pages.ResyncTextElement(Common.GetAncestryToken(),
                                    element.Value.SourceInfo);
                        }
                    }
                    catch (Exception ex)
                    {
                        Log.Warning(ex, "Warning for ResyncAllElements. sourceInfo={sourceInfo},",
                            element.Value.SourceInfo);
                        hadProblems = true;
                    }
                    elementModel.Problems = hadProblems;
                    elementModel.FrameId = element.Key;
                    list.Add(elementModel);
                }
                return list;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in ResyncAllElements FrameCollection={assetMetadata}", assetMetadata);
                throw Common.ChooseException(ex, null);
            }
        }

        public List<ProjectData.Page> NewPage(long projectId, int layoutId, int themeId, int newPageNumber, Hashtable layoutParams)
        {
            var customData = CreatePageParameters(layoutParams);
            try
            {
                // Create new pages
                var newPages = new List<ProjectData.Page>();
                var pages = _editorServices.Pages.NewPage(Common.GetAncestryToken(), projectId, layoutId, themeId, newPageNumber, customData);
                newPages.AddRange(pages);
                newPageNumber += pages.Count;
                return newPages;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "{0}, {1}, {2}, {3}, {4}", projectId, layoutId, themeId, newPageNumber, customData);
                throw;
            }
        }

        public ProjectData.Page[] NewPagesFromTree(long projectId, int layoutId, int productId, int themeId, int startingPageNumber, Hashtable layoutParams, List<ElementInfo> extraElements)
        {
            using (new AppTimer())
            {
                try
                {
                    Common.CheckPermissionsForProject(projectId, false);

                    var customData = CreatePageParameters(layoutParams);

                    var pages = _editorServices.Projects.CreateProjectPagesFromLayout(Common.GetAncestryToken(), projectId, layoutId, productId, themeId, startingPageNumber, customData, extraElements);

                    if (pages == null || pages.Length < 1)
                    {
                        // There was a problem
                        throw new Exception("Unable to create pages from tree with projectId: " + projectId);
                    }

                    return pages;

                }
                catch (Exception ex)
                {
                    if (ex is UnauthorizedAccessException)
                    {
                        Log.Warning(ex, "Warning for NewPagesFromTree. projectId={projectId}, projectId={projectId}, themeId={themeId}, startingPageNumber={startingPageNumber}, layoutParams={layoutParams}, extraElements={extraElements},",
                            projectId, projectId, themeId, startingPageNumber, layoutParams, extraElements);
                    }
                    else
                    {
                        Log.Error(ex, "Error in NewPagesFromTree. projectId={projectId}, projectId={projectId}, themeId={themeId}, startingPageNumber={startingPageNumber}, layoutParams={layoutParams}, extraElements={extraElements},",
                            projectId, projectId, themeId, startingPageNumber, layoutParams, extraElements);
                    }
                    throw Common.ChooseException(ex, "Unable to create new pages. Please try again later.");
                }
            }
        }


	    public ProjectData.Page SavePageThumbnail(int pageId, string url, string format)
	    {
		    return SavePageThumbnail(pageId, CreateThumbnail(_azureBlobStorage.GetTextByPageId(pageId), url, format));
	    }

		public ProjectData.Page SavePageThumbnail(int pageId, string thumbnail)
	    {
		    return _editorServices.Pages.SavePageThumbnail(pageId, thumbnail);
	    }

	    public string CreateThumbnail(string xml, string url, string format)
	    {
	        try
	        {
	            var parsedXml = xml.Replace("localmycanvas", "devmycanvas");
	            var ret = Common.ChiliServiceByUrl(url).DocumentCreateTempFile(format, parsedXml, 0, true);
	            var stream = Common.GetStreamFromUrl(ret.Url);
	            var data = ret.Url.EndsWith(".zip") ? Utilities.GetZippedFileEntry(stream) : stream.ToArray();
	            return "data:image/png;base64," + Convert.ToBase64String(data);
	        }
            catch (Exception ex)
            {
                Log.Error(ex, "Error in CreateThumbnail. format={format}, url={url}, xml={xml} ", format, url, xml);
                return string.Empty;
            }
        }

		private string CreatePageParameters(Hashtable pageParams)
        {
            // Create copy of hashtable with keys all being lower cased.
            // If values are arrayLists then change them to arrays.
            Hashtable newParams = new Hashtable();
            if (pageParams != null)
            {
                foreach (DictionaryEntry entry in pageParams)
                {
                    string key = entry.Key.ToString().ToLower();
                    object value = entry.Value;

                    // the value array from AMF3 can't be cast to an ArrayList - Create a new ArrayList
                    // from the Array passed in.
                    if (value is Array)
                    {
                        value = new ArrayList((Array)value);
                    }

                    if (value is ArrayList)
                    {
                        if (((ArrayList)value).Count > 0)
                        {
                            value = ((ArrayList)value).ToArray(((ArrayList)value)[0].GetType());
                        }
                        else
                        {
                            value = null;
                        }
                    }
                    newParams[key] = value;
                }
            }

            return Utilities.SerializePageCustomData(newParams);
        }
    }
}
