using System;
using Enigma.Manager;
using Enigma.Manager.Data;

namespace MyCanvas.Editor.AppCode.Objects
{
    public class Content
    {
        public long Id;
        public string Category;
        public Content[] Subcategories;
        public Object[] Items;

        public Content()
        {
            // Initialize sub-categories with empty array
            Subcategories = new Content[0];
        }

        public Content(long Id, string category) : this()
        {
            this.Id = Id;
            this.Category = category;
        }

        public Content(ContentData content) : this()
        {
            Id = content.Category.Id;
            Category = content.Category.Name;
        }

        public Content(ECategory category)
        {
            Id = category.Id;
            Category = category.Name;
        }
    }
}