using System;
using System.Collections.Generic;
using MyCanvas.Editor.AppCode.Objects;
using ComBiz.Services.Ancestry;
using Services.Framework.Logging;
using Serilog;
using Services.Framework.ComBiz.Editor.SourceTags;

/// <summary>
/// Methods for Ancestry Person methods.
/// </summary>
namespace MyCanvas.Editor.AppCode.Ancestry
{
    public class Person
    {
        private static ILogger log = LogFactory.Logger.ForContext<Person>();

        /// <summary>
        /// Parameterless constructor needed for Fluorine.
        /// </summary>
        public Person() { }

//        /// <summary>
//        /// Finds the person.
//        /// </summary>
//        /// <param name="treeId">The tree id.</param>
//        /// <param name="firstname">The firstname.</param>
//        /// <param name="lastname">The lastname.</param>
//        public PersonInfo[] FindPerson(string treeId, string firstname, string lastname)
//        {
//            using (new AppTimer())
//            {
//                try
//                {
//                    return Common.Ancestry.FindPersonsbyString(Common.GetAncestryToken(), treeId, firstname + " " + lastname);
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex, "Error in FindPerson. treeId={treeId}, firstname={firstname}, lastname={lastname},", treeId, firstname, lastname);
//                    throw Common.ChooseException(ex, "Unable to perform search for persons.");
//                }
//            }
//        }

        public List<PersonInfo> FindPerson(string treeId, string searchString)
        {
            using (new AppTimer())
            {

                try
                {

                    return Common.Ancestry.FindPersonsbyString(Common.GetAncestryToken(), treeId, searchString);
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in FindPerson. treeId={treeId}, searchString={searchString},", treeId, searchString);
                    throw Common.ChooseException(ex, "Unable to perform search for persons.");
                }
            }
        }

//        public PersonInfo GetPerson(string treeId, string personId)
//        {
//            using (new AppTimer())
//            {

//                try
//                {
//                    return Common.Ancestry.GetPerson(Common.GetAncestryToken(), treeId, personId);
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex, "Error in GetPerson. treeId={treeId}, personId={personId},", treeId, personId);
//                    throw Common.ChooseException(ex, "Unable to get person.");
//                }
//            }
//        }

        /// <summary>
        /// Gets all assets.
        /// </summary>
        /// <param name="treeId">The tree id.</param>
        /// <param name="personId">The person id.</param>
        /// <param name="themeId">The theme id</param>
        public List<Asset> GetAllAssets(string treeId, string personId, int themeId)
        {
            using (new AppTimer())
            {
                try
                {
                    List<AncestryAssetInfo> assets = Common.Ancestry.PersonGetAllAssets(Common.GetAncestryToken(), treeId, personId ?? string.Empty, themeId);
                    return GetAssets(assets);
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetAllAssets. userToken={userToken}, userId={userId}, treeId={treeId}, personId={personId}, themeId={themeId},", Common.GetAncestryToken(), Common.UserId, treeId, personId, themeId);
                    throw Common.ChooseException(ex, "Unable to retrieve assets for person.");
                }
            }
        }

//        public int GetFamilyStart(string treeId, string personId, int numGenerations)
//        {
//            return GetFamilyInfoStart(treeId, personId, numGenerations, true, false, true); // get descendants
//        }

//        public int GetFamilyInfoStart(string treeId, string personId, int numGenerations, bool getDescendants, bool standardizeDates, bool useSilouhettes)
//        {
//            using (new AppTimer())
//            {
//                try
//                {
//                    // Create new pending call for status updates.
//                    int callId = Common.SelfPublishing.AddPendingCall("Running", null);

//                    // Start background thread for request and add status to Session.
//                    Guid userId = Common.UserId;
//                    string ancestryToken = Common.GetAncestryToken();
//                    Thread thread = new Thread(delegate ()
//                    {
//                        try
//                        {
//                            // get descendant families
//                            if (getDescendants)
//                            {
//                                FamilyInfo family = Common.Ancestry.PersonGetDescendantCount(ancestryToken, treeId, personId, numGenerations, standardizeDates, useSilouhettes);
//                                Common.SelfPublishing.UpdatePendingCall(callId, "Succeeded", SerializationHelper.ObjectToXml(family));
//                            }

//                            // get ancestor families
//                            else
//                            {
//                                FamilyInfo[] families = Common.Ancestry.PersonGetAncestorFamilies(ancestryToken, treeId, personId, numGenerations, standardizeDates, useSilouhettes);
//                                Common.SelfPublishing.UpdatePendingCall(callId, "Succeeded", SerializationHelper.ObjectToXml(families));
//                            }
//                        }
//                        catch (Exception ex)
//                        {
//                            log.Error(ex,
//                                "Error in GetFamilyInfoStart. treeId={treeId}, personId={personId}, numGenerations={numGenerations}, getDescendants={getDescendants}, standardizeDates={standardizeDates}, useSilouhettes={useSilouhettes},",
//                                treeId, personId, numGenerations, getDescendants, standardizeDates, useSilouhettes);
//                            Common.SelfPublishing.UpdatePendingCall(callId, "Failed", null);
//                        }
//                    });
//                    thread.IsBackground = true;
//                    thread.Start();

//                    return callId;
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex,
//                        "Error in GetFamilyInfoStart. treeId={treeId}, personId={personId}, numGenerations={numGenerations}, getDescendants={getDescendants}, standardizeDates={standardizeDates}, useSilouhettes={useSilouhettes},",
//                        treeId, personId, numGenerations, getDescendants, standardizeDates, useSilouhettes);
//                    throw Common.ChooseException(ex, null);
//                }
//            }
//        }

//        public Object GetFamilyUpdate(int callId)
//        {
//            return GetPendingCallUpdate(callId);
//        }

//        public Object GetPendingCallUpdate(int callId)
//        {
//            using (new AppTimer())
//            {
//                try
//                {
//                    PendingCall call = Common.SelfPublishing.GetPendingCall(callId);
//                    if (call == null)
//                    {
//                        return -1;
//                    }

//                    switch (call.Status)
//                    {
//                        case "Running":
//                            return 0;

//                        case "Succeeded":
//                            Common.SelfPublishing.DeletePendingCall(callId);
//                            return SerializationHelper.XmlToObject(call.Data);

//                        case "Failed":
//                        default:
//                            Common.SelfPublishing.DeletePendingCall(callId);
//                            return -1;
//                    }
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex, "Error in GetPendingCallUpdate. callId={callId},", callId);
//                    throw Common.ChooseException(ex, null);
//                }
//            }
//        }

//        public EventInfo[] GetEvents(string treeId, string personId)
//        {
//            using (new AppTimer())
//            {
//                try
//                {
//                    return Common.Ancestry.PersonGetEvents(Common.GetAncestryToken(), treeId, personId, false);
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex, "Error in GetEvents. treeId={treeId}, personId={personId},", treeId, personId);
//                    throw Common.ChooseException(ex, "Unable to retrieve events for person.");
//                }
//            }
//        }

//        ////public EventInfoEx[] GetEventsEx(string treeId, string personId)
//        ////{
//        ////    using( new AppTimer() )
//        ////    {
//        ////        try
//        ////        {
//        ////            return Common.Ancestry.PersonGetEventsEx( Common.UserId, treeId, personId, true );
//        ////        }
//        ////        catch( Exception ex )
//        ////        {
//        ////            log.Error( ex, "Error in GetEventsEx. treeId={treeId}; personId={personId};", treeId, personId );
//        ////            throw Common.ChooseException( ex, "Unable to retrieve extended events for person." );
//        ////        }
//        ////    }
//        ////}

//        public PersonInfo[] GetSpouses(string treeId, string personId)
//        {
//            using (new AppTimer())
//            {
//                try
//                {
//                    return Common.Ancestry.PersonGetSpouses(Common.GetAncestryToken(), treeId, personId);
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex, "Error in GetSpouses. treeId={treeId}, personId={personId},", treeId, personId);
//                    throw Common.ChooseException(ex, "Unable to perform search for persons.");
//                }
//            }
//        }
        public List<PersonInfo> GetSpouses(string treeId, string personId)
        {
            using (new AppTimer())
            {
                try
                {
                    return Common.Ancestry.PersonGetSpouses(Common.GetAncestryToken(), treeId, personId);
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetSpouses. treeId={treeId}, personId={personId},", treeId, personId);
                    throw Common.ChooseException(ex, "Unable to perform search for persons.");
                }
            }
        }

//        public List<Record> GetRecords(string treeId, string personId)
//        {
//            using (new AppTimer())
//            {
//                try
//                {
//                    RecordInfo[] records = Common.Ancestry.PersonGetRecords(Common.GetAncestryToken(), treeId, personId);
//                    if (records == null || records.Length == 0)
//                    {
//                        return null;
//                    }

//                    List<Record> newRecords = new List<Record>();
//                    foreach (RecordInfo record in records)
//                    {
//                        newRecords.Add(new Record(record));
//                    }

//                    newRecords.TrimExcess();
//                    return newRecords;
//                }
//                catch (Exception ex)
//                {
//                    log.Error(ex, "Error in GetRecords. treeId={treeId}, personId={personId},", treeId, personId);
//                    throw Common.ChooseException(ex, "Unable to retrieve records for person.");
//                }
//            }
//        }

//        /// <summary>
//        /// Gets the URL for the image associated with the person.
//        /// </summary>
//        /// <param name="treeId"></param>
//        /// <param name="personId"></param>
//        /// <returns>URL for the person's image, null if they don't have an image.</returns>
//        ////public string GetImageUrl( string treeId, string personId )
//        ////{
//        ////    using( new AppTimer() )
//        ////    {
//        ////        try
//        ////        {
//        ////            ImageInfo info = Common.Ancestry.PersonGetImage( Common.UserId, treeId, personId );


//        ////            string returnUrl = null;

//        ////            if( info != null && info.Url != null )
//        ////            {
//        ////                //                returnUrl = Utilities.createCosDownloadUrl(info.Url);
//        ////                returnUrl = info.Url;
//        ////            }
//        ////            return returnUrl;
//        ////        }
//        ////        catch( Exception ex )
//        ////        {
//        ////            log.Error( ex, "Error in GetImageUrl. treeId={treeId}; personId={personId};", treeId, personId );
//        ////            throw Common.ChooseException( ex, "Unable to retrieve image for person." );
//        ////        }
//        ////    }
//        ////}

//        ////public void SaveEventPlaceLocation(string treeId, string personId, string eventId, string placeName, double latitude, double longitude)
//        ////{
//        ////    try
//        ////    {
//        ////        Common.Ancestry.PersonSaveEventPlaceLocation(Common.UserId, treeId, personId, eventId, placeName, latitude, longitude);
//        ////    }
//        ////    catch (Exception ex)
//        ////    {
//        ////        log.Error(ex, "Error in SaveEventPlaceLocation. treeId={treeId}; personId={personId}; eventId={eventId}; placeName={placeName}; latitude={latitude}; longitude={longitude};",
//        ////             treeId, personId, eventId, placeName, latitude, longitude);
//        ////        throw Common.ChooseException(ex, "Unable to perform search for persons.");
//        ////    }
//        ////}

//        ////public void SaveEventPlaceName(string treeId, string personId, string eventId, string name)
//        ////{
//        ////    try
//        ////    {
//        ////        Common.Ancestry.PersonSaveEventPlaceName(Common.UserId, treeId, personId, eventId, name);
//        ////    }
//        ////    catch (Exception ex)
//        ////    {
//        ////        log.Error(ex, "Error in SaveEventPlaceName. treeId={treeId}; personId={personId}; eventId={eventId}; name={name};", treeId, personId, eventId, name);
//        ////        throw Common.ChooseException(ex, "Unable to perform search for persons.");
//        ////    }
//        ////}

        internal static List<Asset> GetAssets(List<AncestryAssetInfo> assets)
        {
            List<Asset> retAssets = new List<Asset>();
            if (assets == null || assets.Count == 0)
            {
                return retAssets;
            }


            foreach (AncestryAssetInfo asset in assets)
            {
                retAssets.Add(new Asset(asset, new ClientInfo() { IsResynchronizable = true }));
            }

            return retAssets;
        }
    }
}
