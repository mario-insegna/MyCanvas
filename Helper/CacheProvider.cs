using System;
using System.Runtime.Caching;
namespace MyCanvas.Editor.Helper
{
    public class CacheProvider : ICacheProvider
    {
        public T GetOrSet<T>(string cacheKey, Func<T> dataCallback) where T : class
        {
            var item = MemoryCache.Default.Get(cacheKey) as T;
            if (item != null) return item;
            item = dataCallback();
            MemoryCache.Default.Add(cacheKey, item, DateTime.Now.AddMinutes(60));
            return item;
        }
    }

    internal interface ICacheProvider
    {
        T GetOrSet<T>(string cacheKey, Func<T> dataCallback) where T : class;
    }


}