using System;
using System.Collections.Specialized;
using System.Reflection;
using System.Web;
using System.Configuration;
using System.IO;
using System.Linq;
using Chili.Services;
using ComBiz.Client.Library.WebEditor;
using Services;
using Services.Framework.Logging;
using Serilog;

namespace MyCanvas.Editor.AppCode
{
    /// <summary>
    /// Common area for helper functions and services.
    /// </summary>
    internal abstract partial class Common
    {
        private static long UserBGCategoryId = -1;

        internal static ComBiz.Services.Ancestry.Ancestry Ancestry = new ComBiz.Services.Ancestry.Ancestry();
        internal static EditorService Editor = new EditorService();

        private static ILogger log = LogFactory.Logger.ForContext<Common>();
        
        static Common ()
        {
            Editor.Url = MyCanvasServices.GetServiceUrl(MyCanvasServices.Services.Editor);
        }

        private static void InitBackgroundCategoryId()
        {
            UserBGCategoryId = Global.EnigmaManager.AddCategory(SelfPubCategoryId, "UserBackgrounds").Id;
        }

        internal static HttpContext Context
        {
            get
            {
                if( HttpContext.Current == null && MyCanvasServices.CurrentEnvironment == MyCanvasServices.Environment.LIVE )
                {
                    log.Fatal("Context null on live");
                }

                return HttpContext.Current;
            }
        }

        internal static string PriceSourceId
        {
            get
            {
                // NOTE: for now only 34406 is valid anyway so just use it.
                return "34406";
            }
        }

        internal static string ReferringHost
        {
            get
            {
                if( Context != null && Context.Request.UrlReferrer != null )
                {
                    return Context.Request.UrlReferrer.Host;
                }
                return "classic.mycanvas.com";
            }
        }

        internal static string SourceId
        {
            get
            {
                if( Context == null )
                {
                    return PriceSourceId;
                }

                HttpCookie sources = HttpContext.Current.Request.Cookies[ "SOURCES" ];
                if( sources != null && sources.HasKeys )
                {
                    NameValueCollection sourcesValues = new NameValueCollection( sources.Values );
                    if( sourcesValues.GetValues( "IID" ) != null )
                    {
                        return sourcesValues.GetValues( "IID" )[ 0 ];
                    }
                }

                return PriceSourceId;
            }
        }

        /// <summary>
        /// Gets array of items constructed from array of old items.
        /// </summary>
        /// <param name="oldItems">The old items.</param>
        internal static NewType[] GetItems<NewType>( object[] oldItems )
        {
            if( oldItems == null )
            {
                return new NewType[ 0 ];
            }

            NewType[] newItems = new NewType[ oldItems.Length ];
            if( oldItems.Length > 0 )
            {
                Type[] constructorTypes = { oldItems[ 0 ].GetType() };
                ConstructorInfo constructor = typeof( NewType ).GetConstructor( constructorTypes );

                for( int i = 0 ; i < oldItems.Length ; i++ )
                {
                    newItems[ i ] = (NewType) constructor.Invoke( new Object[ 1 ] { oldItems[ i ] } );
                }
            }

            return newItems;
        }

        /// <summary>
        /// Build the blob folder name based on pageId.
        /// </summary>
        /// <param name="pageId"></param>
        /// <returns></returns>
        public static string GetPageBlobPath(long pageId)
        {
            // Create string from pageid, add leading zeros so it will always have at least 4 digits
            string blobFolder = ("0000" + pageId);
            blobFolder = blobFolder.Substring(blobFolder.Length - 4);
            return $"{blobFolder}/{pageId}";
        }

        /// <summary>
        /// Get a value from appSettings collection
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="key"></param>
        /// <returns></returns>
        public static T GetAppSetting<T>(string key)
        {
            try
            {
                return ReadSettings(key).To<T>();
            }
            catch (Exception ex)
            {
                log.Error(ex, $"GetAppSetting({key})");
                return default(T);
            }
        }

        private static string ReadSettings(string key)
        {
            var appSettingsReader = new AppSettingsReader();
            return (string)appSettingsReader.GetValue(key, typeof(string));
        }

        public static Stream GetStreamFromUrl(string retUrl)
        {
            byte[] data;
            using (var wc = new System.Net.WebClient())
                data = wc.DownloadData(retUrl);
            return new MemoryStream(data);
        }

        public static Service ChiliServiceByUrl(string url)
        {
            const string key = "apiKey=";
            var queryArray = url.Split('?', '&');
            var apiKey = queryArray.FirstOrDefault(x => x.Contains(key));
            var chiliApiKey = apiKey?.Replace(key, "");
            return new Service(chiliApiKey);
        }
    }
}
