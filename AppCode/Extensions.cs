using System;
using System.IO;

namespace MyCanvas.Editor.AppCode
{
    public static class Extensions
    {
        /// <summary>
        /// String to Generic Type conversion
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="text"></param>
        /// <returns></returns>
        public static T To<T>(this string text)
        {
            try
            {
                return (T)Convert.ChangeType(text, typeof(T));
            }
            catch (Exception)
            {
                return default(T);
            }
        }

        /// <summary>
        /// Converts Stream to byte array
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        public static byte[] ToArray(this Stream input)
        {
            using (var ms = new MemoryStream())
            {
                input.CopyTo(ms);
                return ms.ToArray();
            }
        }
    }
}
