using System;
using System.Collections.Generic;
using System.Threading;
using ComBiz.Services.Ancestry;
using MyCanvas.Editor.AppCode.Objects;
using Services.Framework.Logging;
using Serilog;

/// <summary>
/// Methods for Ancestry Tree methods.
/// </summary>
namespace MyCanvas.Editor.AppCode.Ancestry
{
    public class Tree
    {
        private static readonly ILogger log = LogFactory.Logger.ForContext<Tree>();

        public List<TreeInfo> GetTrees()
        {
            using (new AppTimer())
            {
                try
                {
                    var result = Common.Ancestry.GetTrees( Common.GetAncestryToken() );
                    return result;
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetTrees. userId={userId}, UserName={UserName} ", Common.UserId, Common.User.UserName);
                    Thread.Sleep(1000);
                    return Common.Ancestry.GetTrees( Common.GetNewAncestryToken() );
                }
            }
        }

        public List<Asset> GetAllAssets(string treeId, int themeId)
        {
            using (new AppTimer())
            {
                try
                {
                    List<AncestryAssetInfo> assets = Common.Ancestry.TreeGetAllAssets(Common.GetAncestryToken(), treeId, themeId);
                    return Person.GetAssets(assets);
                }
                catch (Exception ex)
                {
                    log.Error(ex, "Error in GetAllAssets. treeId={treeId}, themeId={themeId},", treeId, themeId);
                    throw Common.ChooseException(ex, "Unable to retrieve assets for tree.");
                }
            }
        }

    }
}
