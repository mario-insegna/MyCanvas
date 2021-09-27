using System;
using System.Collections.Generic;
using System.Web.Http;
using ComBiz.Services.Editor;
using MyCanvas.Editor.AppCode.Objects;
using MyCanvas.Editor.Helper;
using MyCanvas.Editor.Models.EditorApi;
using MyCanvas.ProjectData;
using Services;
using Services.Framework.ComBiz.Editor;
using Enigma.Manager;
using Services.Framework.ComBiz;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class LayoutController : ApiController
    {

        private readonly EditorServices EditorServices;

        public static readonly EManager EnigmaManager = new EManager();

        public LayoutController()
        {
            EditorServices = new EditorServices();
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public GetLayoutResponse GetLayout(int layoutId)
        {
            var layout = EditorServices.Layouts.GetLayout(layoutId);
            var previewImageUrl = EditorServices.Layouts.GetLayoutThumbnailUrl(layout.PreviewImage);

            return new GetLayoutResponse
            {
                TemplateXml = Document.ValidateTemplateXml(layout.TemplateXml),
                Width = layout.Product.Width,
                Height = layout.Product.Height,
                PreviewImageUrl = previewImageUrl
            };
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public string SaveLayout(SaveLayoutRequest req)
        {
            EditorServices.Layouts.SaveLayoutTemplateXml(req.LayoutId, req.TemplateXml);

            return "Layout Saved";
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        public bool SaveLayoutThumbnail(SaveLayoutThumbnailRequest req)
        {
            var appCodePage = new AppCode.SelfPublishing.Page();
            req.Thumbnail = appCodePage.CreateThumbnail(req.Xml, req.Url, "jpg");

            EditorServices.Layouts.SaveLayoutThumbnail(req.LayoutId, req.Thumbnail);

            return true;
        }

        [HttpGet]
        public FolderLayoutModel GetAllContent()
        {
            var cache = new CacheProvider();
            Func<FolderLayoutModel> func = GetContent;
            return cache.GetOrSet("getContent", func);

        }

        private FolderLayoutModel GetContent()
        {
            var firstNode = new FolderLayoutModel
            {
                Id = (int) FolderLayoutModel.FolderName.All,
                Name = FolderLayoutModel.FolderName.All.ToString()
            };
            firstNode.SubFolders.Add(new FolderLayoutModel
            {
                IdTheme = (int) FolderLayoutModel.FolderName.Basic_Layouts,
                Name = FolderLayoutModel.FolderName.Basic_Layouts.ToString().Replace('_', ' '),
                ParentId = firstNode.Id
            });
            var categoriesFolders = CategoriesWithoutParent();
            firstNode.SubFolders.Add(new FolderLayoutModel
            {
                Id = (int) FolderLayoutModel.FolderName.By_Categories,
                Name = FolderLayoutModel.FolderName.By_Categories.ToString().Replace('_', ' '),
                ParentId = firstNode.Id
            });
            foreach (var category in categoriesFolders.SubFolders)
            {
                GetCategoriesWithParent(category, firstNode.SubFolders[1]);
            }
            return firstNode;
        }


        private void GetCategoriesWithParent(FolderLayoutModel category, FolderLayoutModel firstNode)
        {
            category.ParentId = firstNode.Id;
            firstNode.SubFolders.Add(category);
            GetThemesByCategory(category, firstNode);
            var categoriesWithParent = EditorServices.Layouts.GetCategories(category.Id);
            if (categoriesWithParent.Count <= 0) return;
            foreach (var item in categoriesWithParent)
            {
                var categoryWithParentViewModel = new FolderLayoutModel
                {
                    Id = item.CategoryId,
                    Name = item.Name,
                    ParentId = firstNode.Id
                };
                GetCategoriesWithParent(categoryWithParentViewModel, category);
            }
        }

        private void GetThemesByCategory(FolderLayoutModel category, FolderLayoutModel firstNode)
        {
            var themesByCategory = EditorServices.Layouts.GetThemesByCategory(category.Id);
            if (themesByCategory.Count <= 0) return;
            foreach (var theme in themesByCategory)
            {
                var themeFolder = new FolderLayoutModel
                {
                    IdTheme = theme.ThemeId,
                    Name = theme.Name,
                    ParentId = category.Id
                };
                firstNode.SubFolders.Find(c => c.Id == category.Id).SubFolders.Add(themeFolder);
            }
        }

        private FolderLayoutModel CategoriesWithoutParent()
        {
            var categoryListWithoutParent = EditorServices.Layouts.GetCategories(null);
            var categoriesFolder = new FolderLayoutModel();
            foreach (var category in categoryListWithoutParent)
            {
                categoriesFolder.SubFolders.Add(new FolderLayoutModel
                {
                    Id = category.CategoryId,
                    Name = category.Name,
                    ParentId = categoriesFolder.Id
                });
            }
            return categoriesFolder;
        }

        [HttpGet]
        public FolderLayoutModel GetLayouts(int themeId, int productId)
        {
            var model = new FolderLayoutModel();
            List<Layout> layouts;
            if (themeId == (int)FolderLayoutModel.FolderName.Basic_Layouts)
            {
                layouts = EditorServices.Layouts.GetBasicLayouts(productId);
                if (layouts.Count == 0) return model;
            }
            else
            {
                layouts = EditorServices.Layouts.GetLayouts(themeId, productId);
                if (layouts.Count == 0) return model;
            }
            return GetImages(layouts, model);
        }

        private FolderLayoutModel GetImages(IEnumerable<Layout> layouts, FolderLayoutModel model)
        {
            var serviceUrl = MyCanvasServices.GetServiceUrl(MyCanvasServices.Services.PublicWebServices);
            foreach (var layout in layouts)
            {
                var previewImageUrl = EditorServices.Layouts.GetLayoutThumbnailUrl(layout.PreviewImage);
                var item = new ImageObject
                {
                    Height = (int) layout.Product.Height,
                    Width = (int) layout.Product.Width,
                    ImageId = layout.PreviewImage.ToString(),
                    Date = layout.DateAdded.ToString(),
                    Name = layout.DisplayName,
                    ThumbUrl = previewImageUrl.Replace(serviceUrl, ""),
                    CustomData = new Dictionary<string, string> {
                        { "layoutId", layout.LayoutId.ToString() } ,
                        { "themeId", layout.ThemeId.ToString() } ,
                        { "layoutTypeId", ((int)layout.LayoutTypeId).ToString() } ,
                        { "layoutSubTypeId", ((int)layout.LayoutSubTypeId).ToString() } }
                };
                model.Items.Add(item);
            }
            return model;
        }

        [HttpGet]
        public int GetThemeIdByProjectId(int projectId)
        {
            var themeId = -1;
            var project = EditorServices.Projects.GetProject(projectId);
            if (project != null) themeId = project.ThemeId;
            return themeId;
        }


        [HttpPost]
        public string SetLayout(SaveLayoutRequest request)
        {
            var entity = EditorServices.Layouts.GetLayout(request.LayoutId);
            return EditorServices.Pages.MergeElementInfo(request.TemplateXml, entity.TemplateXml);
        }

        [HttpGet]
        public string GetThumbnailUrl(int id)
        {
            var layout = EditorServices.Layouts.GetLayout(id);
            var guid = layout != null ? layout.PreviewImage : Guid.Empty;
            var obj = guid.HasValue ? (!guid.Value.Equals(Guid.Empty) ? EnigmaManager.Fetch(guid.Value) : null) : null;
            return obj != null ? Utilities.createCosDownloadUrl(obj.Id, "xsize=72&cache=no").Replace("localmycanvas", "devmycanvas") : string.Empty;
        }

    }
}