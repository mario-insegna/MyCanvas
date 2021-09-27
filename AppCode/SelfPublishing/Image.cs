using ComBiz.Client.Library;
using ComBiz.Client.Library.WebSelfPublishing;
using ComBiz.Services.Editor;
using Enigma.Manager;
using Enigma.Manager.Data;
using MyCanvas.Editor.AppCode.Objects;
using Serilog;
using Services.Framework.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MyCanvas.Editor.AppCode.SelfPublishing
{
    internal class Image
    {

        private static ILogger log = LogFactory.Logger.ForContext<Image>();
        private static Dictionary<int, Content> s_toolContents = new Dictionary<int, Content>();
        private readonly EditorServices _editorServices;

        public Image()
        {
            _editorServices = new EditorServices();
        }

        // These must match what is in the tool's ContentBrowser
        private const string Type_Embellishments = "otherContent";

        public PhotoContent GetAllImages()
        {
            using (new AppTimer())
            {
                try
                {
                    // Make sure they at least have the initial album structure
                    ECategory firstAlbum = Global.ContentService.GetUploadCategory(Common.UserId);

                    // Get all photo content categories.
                    List<PhotoContent> subs = new List<PhotoContent>();
                    foreach (PhotoContent content in getPhotoContents(firstAlbum.Id))
                    {
                        subs.Add(content);
                    }

                    // Always return a non-visible root category.
                    PhotoContent root = new PhotoContent(0, null);
                    root.Subcategories = subs.ToArray();
                    return root;
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetAllImages");
                    throw Common.ChooseException(ex, "Unable to get images.");
                }
            }
        }

        public string DeleteImages(Guid[] ids)
        {
            using (new AppTimer())
            {
                var ret = new List<Guid>();
                try
                {
                    for (int i = 0; i < ids.Length; i++)
                    {
                        var imageUsed = _editorServices.Pages.ImageUsed(ids[i]);
                        if (imageUsed)
                        {
                            ret.Add(ids[i]);
                        }
                        else
                        {
                            Global.EnigmaManager.Fetch(ids[i]).Delete();
                        }
                    }
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in DeleteImages. Guid list={ids}", string.Join(",", ids.Select(g => g.ToString()).ToArray()));
                    throw ex;
                }
                var error = "Delete Error: ";
                return ret.Count == 0
                    ? ""
                    : ret.Count == 1
                        ? error + "The image is being used"
                        : ret.Count == ids.Length
                            ? error + "The selected images are being used"
                            : error + "Some images are being used";
            }
        }

        public PhotoContent CreateAlbum(string name)
        {
            using (new AppTimer())
            {
                try
                {
                    ECategory userUploads = Global.ContentService.GetUploadCategory(Common.UserId);

                    // Make sure this album doesn't already exist
                    ECategory album = Global.EnigmaManager.GetCategory(userUploads.Id, name);
                    if (album != null)
                    {
                        // Enigma won't let you add a category with the same name as another, it just returns
                        // the existing one... so this is a work-around
                        album = Global.EnigmaManager.AddCategory(userUploads.Id, "My Photos");
                        album.Name = name;
                        album.Save();
                    }
                    else
                    {
                        album = Global.EnigmaManager.AddCategory(userUploads.Id, name);
                    }

                    return new PhotoContent(album);
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in CreateAlbum. name={name},", name);
                    throw ex;
                }
            }
        }

        public void DeleteAlbum(long id)
        {
            using (new AppTimer())
            {
                try
                {
                    // We just want to delete the category, not the photos
                    Global.EnigmaManager.MoveCategoryToBeUnderUserHidden(id, Common.UserId);
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in DeleteAlbum. id={id}, userId={UserId},", id, Common.UserId);
                    throw Common.ChooseException(ex, "Unable to delete album");
                }
            }
        }

        public static Content GetCategory(long Id, string type)
        {
            using (new AppTimer())
            {
                // Create the content object
                Content content = new Content(Id, "root");

                // Get the direct children of this category
                List<EObject> items = Global.EnigmaManager.GetObjectsByCategory(Id, includeSubcategories: false, includeChildren: false, includeAppData: false);
                items.Sort(Common.CompareObjectsByCaption);
                content.Items = CreateEmbellishmentInfoItems(items, null);

                // Recursively get the sub categories
                List<ECategory> subCategories = Global.EnigmaManager.GetCategories(Id);
                subCategories.Sort(Common.CompareCategories);

                List<Content> children = new List<Content>();
                foreach (ECategory subCategory in subCategories)
                {
                    children.Add(new Content(subCategory.Id, subCategory.Name));
                }
                content.Subcategories = children.ToArray();

                return content;
            }
        }

        public List<ProjectData.ImageUsage> GetImageUsage(long projectId)
        {
            return _editorServices.Pages.ImageUsagesByProjectId(projectId);
        }

        public Embellishment[] GetImages(long categoryId, string searchString, string type)
        {
            using (new AppTimer())
            {
                searchString = (searchString ?? string.Empty).ToLower();

                List<EObject> results = Global.EnigmaManager.GetObjectsByCategory(categoryId, includeSubcategories: true, includeChildren: false, includeAppData: false);
                List<EObject> filteredResults = new List<EObject>();
                foreach (EObject obj in results)
                {
                    if (obj.MetaData.Caption != null && obj.MetaData.Caption.ToLower().Contains(searchString))
                    {
                        filteredResults.Add(obj);
                    }
                }

                filteredResults.Sort(Common.CompareObjectsByCaption);
                return CreateEmbellishmentInfoItems(filteredResults, null);
            }
        }

        public Content GetAllContent(int partnerId)
        {
            using (new AppTimer())
            {
                try
                {
                    if (s_toolContents == null || s_toolContents.Count == 0)
                    {
                        ReInitToolsContent();
                    }
                    return s_toolContents[partnerId];
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetAllContent. partnerId={partnerId},", partnerId);
                    throw Common.ChooseException(ex, "Unable to get content");
                }
            }
        }

        private List<PhotoContent> getPhotoContents(long uploadedPhotosId)
        {
            List<PhotoContent> result = new List<PhotoContent>();
            using (var apptimer = new AppTimer())
            {
                apptimer["CategoryId"] = uploadedPhotosId;
                ContentData userData = Global.EnigmaManager.GetUserContent(Common.UserId, false);

                foreach (ContentData data in userData.Content)
                {
                    if ((data.Content.Count > 0) || (data.Objects.Count > 0) || data.Category.Id == uploadedPhotosId)
                    {
                        result.Add(createPhotoContent(data));
                    }
                }
            }
            return result;
        }

        private static Embellishment[] CreateEmbellishmentInfoItems(List<EObject> items, Object notUsed)
        {
            return Common.GetItems<Embellishment>(items.ToArray());
        }

        private PhotoContent createPhotoContent(ContentData content)
        {
            PhotoContent category = new PhotoContent(content);

            int siteId = Constants.MY_COMPUTER_TYPE_ID;

            if (content.Site != null)
            {
                siteId = content.Site.Id;
            }

            if (content.Objects.Count > 0)
            {
                category.Items = createImageObjects(content.Objects, false);
            }

            // Add categories with their items.
            List<PhotoContent> subCategories = new List<PhotoContent>();
            foreach (ContentData entry in content.Content)
            {
                PhotoContent subCategory = new PhotoContent(entry.Category);
                subCategory.SiteId = siteId;

                // if the category contains a CategoryInfo object then the images are from an external site and will be sorted by name
                subCategory.Items = createImageObjects(entry.Objects, entry.Category.Data.ContainsKey(AppDataKeys.CategoryData));

                subCategories.Add(subCategory);
            }
            subCategories.Sort(delegate (PhotoContent x, PhotoContent y)
            {
                return x.Category.CompareTo(y.Category);
            });
            category.Subcategories = subCategories.ToArray();

            return category;
        }

        private ImageObject[] createImageObjects(List<EObject> items, bool sort)
        {
            if (sort)
            {
                items.Sort(
                    delegate (EObject x, EObject y)
                    {
                    // could sort by name, but what happens to the list when some images don't have a name
                    return x.AlternateId.CompareTo(y.AlternateId);
                    });
            }
            else
            {
                items.Reverse();
            }

            return Common.GetItems<ImageObject>(items.ToArray());
        }

        private static void ReInitToolsContent()
        {
            // Get and cache embellishments root structure for each partner.
            foreach (ECategory partnerContentCat in Global.EnigmaManager.GetCategories(
                Global.EnigmaManager.GetCategory(Common.SelfPubCategoryId, "Tool Content").Id))
            {
                ECategory root = Global.EnigmaManager.GetCategory(partnerContentCat.Id, "All");
                PartnerInfo partner = PartnerManager.PartnersByName[partnerContentCat.Name];

                // Create the content object
                Content toolContent = s_toolContents[partner.Id] = GetCategory(root.Id, Type_Embellishments);
                toolContent.Category = root.Name;

                // Pre-populate the embelishments and themes categories for pre-selection in the tool.
                int embellishmentsIndex = -1;
                for (int i = 0; i < toolContent.Subcategories.Length; i++)
                {
                    if (toolContent.Subcategories[i].Category == "Embellishments")
                    {
                        embellishmentsIndex = i;
                        break;
                    }
                }

                Content embellishments = GetCategory(toolContent.Subcategories[embellishmentsIndex].Id, Type_Embellishments);
                embellishments.Category = toolContent.Subcategories[embellishmentsIndex].Category;
                toolContent.Subcategories[embellishmentsIndex] = embellishments;

                for (int i = 0; i < embellishments.Subcategories.Length; i++)
                {
                    if (embellishments.Subcategories[i].Category == "All Themes")
                    {
                        Content allThemes = GetCategory(embellishments.Subcategories[i].Id, Type_Embellishments);
                        allThemes.Category = embellishments.Subcategories[i].Category;

                        // Populate the calendar subcategories so they'll select correctly in the tool
                        for (int x = 0; x < allThemes.Subcategories.Length; x++)
                        {
                            if (allThemes.Subcategories[x].Category == "Calendars")
                            {
                                Content calendarThemes = GetCategory(allThemes.Subcategories[x].Id, Type_Embellishments);
                                calendarThemes.Category = allThemes.Subcategories[x].Category;
                                allThemes.Subcategories[x] = calendarThemes;
                                break;
                            }
                        }

                        embellishments.Subcategories[i] = allThemes;

                        break;
                    }
                }
            }
        }

    }
}