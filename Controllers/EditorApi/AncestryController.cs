using System.Collections.Generic;
using System.Web.Http;
using ComBiz.Services.Ancestry;
using MyCanvas.Editor.AppCode.Ancestry;
using MyCanvas.Editor.AppCode.Objects;

namespace MyCanvas.Editor.Controllers.EditorApi
{
    public class AncestryController : ApiController
    {

        [HttpGet]
        public List<PersonInfo> FindPerson(string treeId, string searchString)
        {
            Person person = new Person();
            List<PersonInfo> personInfoList = person.FindPerson(treeId, searchString);

            return personInfoList;
        }

        [HttpGet]
        public List<Asset> GetAllAssetsByPerson(string treeId, string personId, int themeId)
        {
            Person person = new Person();
            List<Asset> arrayList = person.GetAllAssets(treeId, personId, themeId);

            return arrayList;
        }

        [HttpGet]
        public List<PersonInfo> GetSpouses(string treeId, string personId)
        {
            var person = new Person();
            var arrayList = person.GetSpouses(treeId, personId);
            return arrayList;
        }

        [HttpGet]
        public List<Asset> GetAllAssetsByTree(string treeId, int themeId)
        {
            Tree tree = new Tree();
            List<Asset> arrayList = tree.GetAllAssets(treeId, themeId);

            return arrayList;
        }

        [HttpGet]
        public List<TreeInfo> GetTrees()
        {
            Tree tree = new Tree();
            List<TreeInfo> treeInfoList = tree.GetTrees();

            return treeInfoList;
        }

    }
}