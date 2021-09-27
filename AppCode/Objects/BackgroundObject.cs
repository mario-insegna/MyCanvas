using ComBiz.Client.Library.WebSelfPublishing;
using Enigma.Manager;

namespace MyCanvas.Editor.AppCode.Objects
{
    public class BackgroundObject
    {
        public string Id;
        public string Name;
        public ElementInfoImage Element;

        public BackgroundObject(EImage image)
        {
            Id = image.Id.ToString();
            Name = image.MetaData.Caption;
        }
    }
}