using System.Collections.Generic;
using MyCanvas.Editor.AppCode.Objects;

namespace MyCanvas.Editor.Models.EditorApi
{
    public class FolderLayoutModel
    {
        public FolderLayoutModel()
        {
            SubFolders = new List<FolderLayoutModel>();
            Items = new List<ImageObject>();
        }
        public int Id { get; set; }
        public string Name { get; set; }
        public int IdTheme { get; set; }
        public List<FolderLayoutModel> SubFolders { get; set; }
        public List<ImageObject> Items { get; set; }
        public int? ParentId { get; set; }

        public enum FolderName
        {
            All= -1,
            // ReSharper disable once InconsistentNaming
            Basic_Layouts= -7,
            // ReSharper disable once InconsistentNaming
            By_Categories= -2
        }
    }
}