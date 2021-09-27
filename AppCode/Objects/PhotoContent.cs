using System;
using Enigma.Manager;
using Enigma.Manager.Data;

namespace MyCanvas.Editor.AppCode.Objects
{
    public class PhotoContent : Content
    {
        // Site album values.
        public string AlbumId;
        public string AlbumKey;

        // Keep track of which photo site this came from
        public int SiteId;

        public PhotoContent() : base()
        {
        }

        public PhotoContent( long id, string category ) : base( id, category )
        {
        }

        public PhotoContent( long Id, string category, int siteId ) : base( Id, category )
        {
            SiteId = siteId;
        }

        public PhotoContent( ContentData content ) : this()
        {
            Id = content.Category.Id;
            Category = content.Category.Name;
            // Assume if there is no site then this is the user-uploaded category
            SiteId = content.Site == null ? Constants.MY_COMPUTER_TYPE_ID : content.Site.Id;
            Items = new Object[0];
        }

        public PhotoContent( ECategory category )
        {
            Category = category.Name;
            Id = category.Id;
            SiteId = Constants.MY_COMPUTER_TYPE_ID;
            Items = new Object[0];

			if(category.Data.ContainsKey(AppDataKeys.CategoryData))
			{
				CategoryInfo info = category.Data[AppDataKeys.CategoryData] as CategoryInfo;
				AlbumId = info.Id;
				AlbumKey = info.Key;
			}
        }
    }
}
