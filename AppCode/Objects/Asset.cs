using System;
using ComBiz.Services.Ancestry;
using Services.Framework.ComBiz.Editor.SourceTags;

namespace MyCanvas.Editor.AppCode.Objects
{
    /// <summary>
    /// Wrapper class for WebAncestry.RecordInfo that hides unwanted fields.
    /// </summary>
    [Serializable]
    public class Asset
    {
        public AssetMetadata AssetMetadata;
        public ImageObject ImageInfo;
        public Record RecordInfo;
        public StoryInfo StoryInfo;
        public NoteInfo NoteInfo;
        public CommentInfo CommentInfo;
        public EventInfo EventInfo;

        public Asset(AncestryAssetInfo asset, ClientInfo clientInfo)
        {
            ImageInfo = asset is ImageInfo ? CreateImageInfo((ImageInfo) asset) : null;
            RecordInfo = asset is RecordInfo ? new Record((RecordInfo) asset) : null;
            StoryInfo = asset as StoryInfo;
            NoteInfo = asset as NoteInfo;
            CommentInfo = asset as CommentInfo;
            EventInfo = asset as EventInfo;

            AssetMetadata = new AssetMetadata()
            {
                ClientInfo = clientInfo,
                SourceInfo = new SourceInfo(asset.SourceTagString)
            };
        }

        private static ImageObject CreateImageInfo(ImageInfo asset)
        {
            try
            {
                return new ImageObject(asset);
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}