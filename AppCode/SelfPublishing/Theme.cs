using System;
using System.Collections.Generic;
using System.Linq;
using ComBiz.Client.Library;
using Enigma.Manager;
using MyCanvas.Editor.AppCode.Objects;
using Serilog;
using Services.Framework.Logging;
using System.Globalization;

namespace MyCanvas.Editor.AppCode.SelfPublishing
{
    public class Theme
    {

        private static ILogger log = LogFactory.Logger.ForContext<Theme>();
        private readonly Dictionary<long, Content> BackgroundsByCategoryId = new Dictionary<long, Content>();
        private Dictionary<int, Dictionary<string, ECategory>> _categoriesBySizeByPartnerId;

        public Content GetBackgrounds(double pageWidth, double pageHeight, int partnerId)
        {
            using (new AppTimer())
            {
                try
                {
                    ECategory category = GetCategory(pageWidth, pageHeight, partnerId);
                    if (category == null)
                    {
                        Content content = new Content(0, "All");
                        return content;
                    }

                    if (!BackgroundsByCategoryId.ContainsKey(category.Id))
                    {
                        BackgroundsByCategoryId.Add(category.Id, Common.GetContent(category, category, CreateBackgroundObjects));
                    }
                    Content backgrounds = BackgroundsByCategoryId[category.Id];

                    // Since we're adding user backgrounds and the static backgrounds are cached, we don't want
                    // to add the user backgrounds into the cache so we need a new Content 
                    Content result = new Content();
                    result.Category = "All";
                    result.Items = backgrounds.Items;
                    result.Subcategories = backgrounds.Subcategories;

                    // Get user backgrounds if there are any
                    Content userBackgrounds = GetUserBackgrounds(pageWidth, pageHeight, partnerId);
                    if (userBackgrounds != null)
                    {
                        List<Content> subcategories = new List<Content>(backgrounds.Subcategories);
                        if (!subcategories.Contains(userBackgrounds))
                        {
                            subcategories.Insert(0, userBackgrounds);
                        }
                        result.Subcategories = subcategories.ToArray();
                    }

                    return result;
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetBackgrounds. pageWidth={pageWidth}, pageHeight={pageHeight}, partnerId={partnerId}, userId={userId},", pageWidth, pageHeight, partnerId, Common.UserId);
                    throw Common.ChooseException(ex, "Unable to get backgrounds.  Please try again later.");
                }
            }
        }

        public Content GetUserBackgrounds(double pageWidth, double pageHeight, int partnerId)
        {
            using (new AppTimer())
            {
                try
                {
                    ECategory category = Common.UserBackgroundCategory;
                    ECategory backgroundCategory = GetCategory(pageWidth, pageHeight, partnerId);
                    if (category == null || backgroundCategory == null)
                    {
                        return null;
                    }

                    Content backgrounds = Common.GetContent(backgroundCategory, category, CreateBackgroundObjects);

                    backgrounds.Category = "My Backgrounds";
                    backgrounds.Id = Common.UserBackgroundCategory.Id;

                    return backgrounds;
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetUserBackgrounds. pageWidth={pageWidth}, pageHeight={pageHeight}, paretnerId={partnerId},", pageWidth, pageHeight, partnerId);
                    throw Common.ChooseException(ex, "Unable to get backgrounds.  Please try again later.");
                }
            }
        }

        private BackgroundObject[] CreateBackgroundObjects(List<EObject> items, ECategory category)
        {
            int xIndex = category.Name.IndexOf("x", StringComparison.Ordinal);
            decimal pageWidth = decimal.Parse(category.Name.Substring(0, xIndex));
            decimal pageHeight = decimal.Parse(category.Name.Substring(xIndex + 1));

            // Just to be safe and make sure the background will completely fill the final pdf add a little more
            // This will also help with the transition if we decide to increase the pdf size we sent to the printer
            // to help with cutting error
            decimal pad = .03125M; // 1/32"

            decimal cropTop = decimal.Parse(category.Data[Constants.CropTop].ToString()) + pad;
            decimal cropBottom = decimal.Parse(category.Data[Constants.CropBottom].ToString()) + pad;
            decimal cropLeft = decimal.Parse(category.Data[Constants.CropLeft].ToString()) + pad;
            decimal cropRight = decimal.Parse(category.Data[Constants.CropRight].ToString()) + pad;

            List<BackgroundObject> backgrounds = new List<BackgroundObject>();

            foreach (EImage image in items)
            {
                BackgroundObject background = new BackgroundObject(image);
                if (background.Element != null)
                {
                    backgrounds.Add(background);
                }
            }

            return backgrounds.ToArray();
        }

        private ECategory GetCategory(double pageWidth, double pageHeight, int partnerId)
        {
            if (_categoriesBySizeByPartnerId == null)
            {
                RepopulateCategoriesBySizeByPartnerId();
            }
            if (_categoriesBySizeByPartnerId == null) throw new Exception(string.Format("_categoriesBySizeByPartner failed to initialize during accessor."));
            ECategory category;
            var categoriesBySize = _categoriesBySizeByPartnerId[partnerId];
            if (categoriesBySize == null)
            {
                var message = string.Format("Unable to find categories by size for partner: {0}", partnerId);
                log.Error(message);
                throw new Exception(message);
            }
            var size = string.Format(CultureInfo.InvariantCulture, "{0}x{1}", pageWidth, pageHeight);
            if (categoriesBySize.TryGetValue(size,
                out category))
            {
                return category;
            }
            var msg = string.Format("Unable to find category for size. partnerId={0}, size={1}", partnerId, size);
            log.Error(msg);
            return categoriesBySize.First().Value;
        }

        private void RepopulateCategoriesBySizeByPartnerId()
        {
            long bgCatId = Global.EnigmaManager.GetCategory(Common.SelfPubCategoryId, "Backgrounds").Id;

            var tempCategoriesBySizeByPartnerId = new Dictionary<int, Dictionary<string, ECategory>>();
            foreach (ECategory partnerCat in Global.EnigmaManager.GetCategories(bgCatId))
            {
                Dictionary<string, ECategory> categoriesBySize = Global.EnigmaManager.GetCategories(partnerCat.Id).ToDictionary(sizeCat => sizeCat.Name);

                tempCategoriesBySizeByPartnerId.Add(PartnerManager.PartnersByName[partnerCat.Name].Id, categoriesBySize);
            }
            _categoriesBySizeByPartnerId = tempCategoriesBySizeByPartnerId;
        }

    }
}