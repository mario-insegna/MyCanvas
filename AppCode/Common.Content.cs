using System;
using System.Collections.Generic;
using System.IO;
using Enigma.Manager;
using MyCanvas.Editor.AppCode.Objects;

namespace MyCanvas.Editor.AppCode
{
    /// <summary>
    /// Common area for Enigma content retrieval.
    /// </summary>
    internal abstract partial class Common
    {
        internal delegate object[] ItemCreatorDelegate( List<EObject> items, ECategory category );

        internal static long SelfPubCategoryId
        {
            get
            {
                return Global.EnigmaManager.GetCategory( 1, "Self Publishing" ).Id;
            }
        }

        internal static ECategory UserBackgroundCategory
        {
            get
            {
                if (UserBGCategoryId == -1)
                {
                    InitBackgroundCategoryId();
                }
                return Global.EnigmaManager.AddCategory(UserBGCategoryId, Common.UserId.ToString());
            }
        }

        internal static Guid ConvertBackgroundId( string guid )
        {
            if( guid == null )
            {
                return new Guid( Constants.NO_BACKGROUND_GUID );
            }
            else
            {
                return new Guid( guid );
            }
        }

        internal static string ConvertBackgroundId( Guid backgroundGuid )
        {
            if( backgroundGuid.ToString() == Constants.NO_BACKGROUND_GUID )
            {
                return null;
            }
            else
            {
                return backgroundGuid.ToString();
            }
        }

        internal static Content GetContent( ECategory parent, ECategory category, ItemCreatorDelegate itemCreator )
        {
            // Create the content object
            Content content = new Content();
            content.Category = category.Name;
            content.Id = category.Id;

            // Get the direct children of this category
            List<EObject> items = Global.EnigmaManager.GetObjectsByCategory(category.Id, includeSubcategories: false, includeChildren: false, includeAppData: false);
            items.Sort( CompareObjectsByCaption );
            content.Items = itemCreator( items, parent );

            // Recursively get the sub categories
            List<ECategory> subCategories = Global.EnigmaManager.GetCategories(category.Id);
            subCategories.Sort( CompareCategories );

            List<Content> children = new List<Content>();
            foreach (ECategory subCategory in subCategories)
            {
                children.Add( GetContent( parent, subCategory, itemCreator ) );
            }
            content.Subcategories = children.ToArray();

            return content;
        }

        internal static Guid SaveImage( Guid Id, string enigmaNamespace, string alternateId, object[] image, string changeCategory )
        {
            // Turn into byte array
            byte[] bytes = new byte[ image.Length ];
            for( int i = 0 ; i < image.Length ; i++ )
            {
                bytes[ i ] = (byte) ( (int) image[ i ] );
            }

            // Push into memory stream
            MemoryStream stream = new MemoryStream( bytes.Length );
            stream.Write( bytes, 0, bytes.Length );
            stream.Flush();
            stream.Seek( 0, SeekOrigin.Begin );

            EObject eImage = Global.EnigmaManager.SaveImage( Id, stream, enigmaNamespace, alternateId );

            // Kill old children
            foreach( EObject child in eImage.Children )
            {
                Global.EnigmaManager.RemoveObject( child.Id );
            }

            if( !string.IsNullOrEmpty( changeCategory ) )
            {
                Global.EnigmaManager.AddChange( eImage, EChangeAction.Replaced, changeCategory );
            }

            return eImage.Id;
        }

        internal static int CompareCategories( ECategory x, ECategory y )
        {
            // If the categories have a sort order defined in the meta data use it
            // A category that defines a sort-order will always come before a category
            // that doesn't
            int xSort = -1;
            int ySort = -1;
            if ( x.Data.ContainsKey( Constants.SortOrder ))
            {
                xSort = Convert.ToInt32(x.Data[Constants.SortOrder]);
            }
            if ( y.Data.ContainsKey( Constants.SortOrder ))
            {
                ySort = Convert.ToInt32(y.Data[Constants.SortOrder]);
            }

            if (xSort >= 0 && ySort >= 0)
            {
                // Both of them define a sort order
                return xSort.CompareTo( ySort );
            }
            else if (xSort >= 0)
            {
                // Only category x defines a sort order
                return -1;
            }
            else if (ySort >= 0)
            {
                return 1;
            }
            else
            {
                // Neither category defines a sort order... sort alphabetically
                return x.Name.CompareTo( y.Name );
            }
        }

        internal static int CompareObjectsByCaption( EObject x, EObject y )
        {
            // Make sure null captions don't break us
            string captionX = x.MetaData.Caption;
            string captionY = y.MetaData.Caption;
            if ( captionX == null )
            {
                captionX = string.Empty;
            }
            if ( captionY == null )
            {
                captionY = string.Empty;
            }

            return captionX.CompareTo( captionY );
        }
    } 
}
