using System;

namespace MyCanvas.Editor.Models.EditorApi
{
    public class CreateAlbumRequest
    {
        public string Name { get; set; }
    }

    public class DeleteAlbumRequest
    {
        public long Id { get; set; }
    }

    public class DeleteImageRequest
    {
        public Guid[] Ids { get; set; }
    }
}