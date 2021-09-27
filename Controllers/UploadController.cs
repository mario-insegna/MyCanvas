using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using Enigma.Manager;
using MyCanvas.Editor.AppCode;
using MyCanvas.Editor.Models;
using Serilog;
using Services;
using Services.Framework.Logging;

namespace MyCanvas.Editor.Controllers
{
    [Authorize]
    public class UploadController : Controller
    {

        private static ILogger log = LogFactory.Logger.ForContext<UploadController>();
        private static Dictionary<string, MemoryStream[]> uploadContentDictionary = new Dictionary<string, MemoryStream[]>();

        [HttpPost]
        public FineUploaderResult UploadFile(FineUpload fineUpload, bool isBackground = false, long? AlbumId = null, bool isLayoutDataUpload = false, string nmspace = null, string cat = null)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    string outputMessage;
                    bool succeed = this.ProcessStream(fineUpload.InputStream, Request.Params["qquuid"],
                        Convert.ToInt32(Request.Params["qqpartindex"]), Convert.ToInt32(Request.Params["qqtotalparts"]), Request.Params["qqfilename"],
                        isBackground, AlbumId, isLayoutDataUpload, nmspace, cat, out outputMessage);

                    if (succeed)
                    {
                        return new FineUploaderResult(true, new { extraInformation = outputMessage });
                    }

                    return new FineUploaderResult(false, error: outputMessage);
                }
                catch (Exception ex)
                {
                    return new FineUploaderResult(false, error: ex.Message);
                }
            }
            else
            {
                return new FineUploaderResult(false, error: "Incomplete request.");
            }
        }

        private bool ProcessStream(Stream stream, string fileId, int partIndex, int totalParts, string fileName, bool isBackground, long? AlbumId,
            bool isLayoutDataUpload, string nmspace, string cat, out string outputMessage)
        {
            MemoryStream memoryStream = new MemoryStream();
            stream.CopyTo(memoryStream);

            if (totalParts > 0)
            {
                if (!uploadContentDictionary.ContainsKey(fileId))
                {
                    uploadContentDictionary.Add(fileId, new MemoryStream[totalParts]);
                }

                uploadContentDictionary[fileId][partIndex] = memoryStream;

                if (uploadContentDictionary[fileId].Count(x => x == null) == 0)
                {
                    MemoryStream wholeStream = new MemoryStream();
                    for (int i = 0; i < totalParts; i++)
                    {
                        uploadContentDictionary[fileId][i].WriteTo(wholeStream);
                    }

                    bool succeed = (this.ProcessFile(wholeStream, fileName, isBackground, AlbumId,
                        isLayoutDataUpload, nmspace, cat, out outputMessage));

                    uploadContentDictionary.Remove(fileId);
                    return succeed;
                }
            }
            else
            {
                return ProcessFile(memoryStream, fileName, isBackground, AlbumId, isLayoutDataUpload, nmspace, cat, out outputMessage);
            }

            outputMessage = string.Empty;
            return true;
        }

        public bool ProcessFile(MemoryStream stream, string fileName, bool isBackground, long? AlbumId, bool isLayoutDataUpload, string nmspace, string cat, out string outputMessage)
        {
            string enigmaNamespace = "SelfPublishing.UploadedImages";
            string alternateId = Common.UserId.ToString();

            #region CheckForUserAuth

            try
            {
                Guid g = Common.UserId;
            }
            catch (Exception ex)
            {
                if (ex.Message.StartsWith(Common.UnauthenticatedMessage))
                {
                    log.Error(ex, "Error in checkForUserAuth.");
                    outputMessage = "Forbidden";
                    return false;
                }

                throw;
            }

            #endregion

            #region GetAlbumToUploadTo

            long albumId = -1;

            if (isBackground)
            {
                // This is a user background
                albumId = Common.UserBackgroundCategory.Id;
                enigmaNamespace = "SelfPublishing.UserBackground";
            }
            else if (AlbumId.HasValue)
            {
                albumId = AlbumId.Value;
            }
            else
            {
                // Not sure what to do here... we should always have an album id when uploaded photos
                albumId = Global.ContentService.GetUploadCategory(Common.UserId).Id;
            }

            #endregion

            #region CheckFileFormat

            // ignore anything but accepted formats
            switch (Path.GetExtension(fileName).ToLower())
            {
                case ".jpg":
                case ".jpeg":
                case ".png":
                    break;

                default:
                    log.Warning("Warning for checkFileFormat. Bad file format={name}", fileName);
                    outputMessage = string.Format($"{fileName} - NotAcceptable");
                    return false;
            }

            #endregion

            #region Save

            try
            {
                if (!isLayoutDataUpload)  // Normal image upload
                {
                    // Save image into COS.
                    EImage eImage = this.SaveImageIntoCos(stream, fileName, enigmaNamespace, albumId, alternateId);
                }
                else
                {
                    // We are uploading images to be used as backgrounds or embellishments
                    // Only allow this to be done on DEV
                    if (Common.IsAdminUser
                        && (MyCanvasServices.CurrentEnvironment == MyCanvasServices.Environment.DEV ||
                            MyCanvasServices.CurrentEnvironment == MyCanvasServices.Environment.LOCAL ||
                            MyCanvasServices.CurrentEnvironment == MyCanvasServices.Environment.STAGE))
                    {
                        if (!String.IsNullOrEmpty(nmspace) && !String.IsNullOrEmpty(cat))
                        {
                            int categoryId = int.Parse(cat);
                            // Save image into COS.
                            EImage eImage = this.SaveImageIntoCos(stream, fileName, nmspace, categoryId, null);
                        }
                    }
                    else
                    {
                        throw new InvalidOperationException("Not enough rights");
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error(ex, "Error in Page_Load. ContentLength={contentLength}, FileName={fileName}",
                    stream.Length, fileName);
                outputMessage = "InternalServerError";
                return false;
            }

            #endregion

            // There is a Flex Mac OSX bug where the upload complete event doesn't fire if the response length is zero.
            outputMessage = " ";
            return true;
        }

        private EImage SaveImageIntoCos(MemoryStream stream, string fileName, string appNamespace, long albumId, string alternateId)
        {
            EImage eImage = null;

            eImage = (EImage)Global.EnigmaManager.CreateImage(Global.EnigmaManager.GetApplication(appNamespace));
            //Global.EnigmaManager.CheckImageRotation( eImage.Id, true );
            eImage.MetaData.Caption = Path.GetFileNameWithoutExtension(fileName);
            if (!string.IsNullOrEmpty(alternateId))
            {
                eImage.AlternateId = alternateId;
            }
            eImage.Save(stream, true);

            if (albumId > 0)
            {
                Global.EnigmaManager.AddCategoryAssociation(eImage.Id, albumId);
            }

            return eImage;
        }
    }
}