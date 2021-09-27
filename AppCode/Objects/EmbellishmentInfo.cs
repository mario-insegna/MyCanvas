using Enigma.Manager;

namespace MyCanvas.Editor.AppCode.Objects
{
    public class Embellishment : ImageObject
    {
        public string IsUsed { get; set; }
        public Embellishment() { }

        public Embellishment(EImage image) : base(image)
        {

        }
    }
}