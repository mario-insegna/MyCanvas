using System;
using System.Collections;
using System.Text;
using System.Web;
using Services;
using ComBiz.Services.Editor;
using Services.Framework.Security;
using MyCanvas.SecurityManager.Identity;
using MyCanvas.SecurityManager.Identity.Models;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.AspNet.Identity;
using Services.Framework.ComBiz.SelfPublishing;

namespace MyCanvas.Editor.AppCode
{
    /// <summary>
    /// Common area for exception handling and user information
    /// </summary>
    internal partial class Common
    {
        internal const string UnauthenticatedMessage = "Call made without authenticated cookie, Host:";
        internal static EditorServices EditorServices = new EditorServices();
        private const string CONTEXT_ACCESS_RIGHT = "context_access_right";
        private const string CONTEXT_USER = "context_user";
        private const string AdminUsername = "combizuser";
        private static MyCanvasUser s_adminUser = null;

        internal static MyCanvasUserManager UserManager
        {
            get
            {
                return Context.GetOwinContext().GetUserManager<MyCanvasUserManager>();
            }
        }
        internal static MyCanvasSignInManager SignInManager
        {
            get
            {
                return Context.GetOwinContext().Get<MyCanvasSignInManager>();
            }
        }

        internal static string GetAncestryToken()
        {
            return User.GetAncestryTokenAsync(SignInManager).Result;
        }

        internal static string GetNewAncestryToken()
        {
            return User.GetNewAncestryTokenAsync(SignInManager).Result;
        }

        internal static Guid AnonymousId
        {
            get
            {
                return new Guid( AnonymousIdStr );
            }
        }

        internal static string AnonymousIdStr
        {
            get
            {
                return Context.Request.AnonymousID;
            }
        }

        internal static bool IsAdminUser
        {
            get
            {
                return Context.User.IsInRole(MyCanvasUserManager.ROLE_CustomerService) || Context.User.IsInRole(MyCanvasUserManager.ROLE_SuperAdmin);
            }
        }

        internal static bool IsAuthenticated
        {
            get
            {
                if( Context == null )
                {
                    return false;
                }
                return Context.User.Identity.IsAuthenticated;
            }
        }

        internal static MyCanvasUser User
        {
            get
            {
                return getUser( true );
            }
        }

        internal static MyCanvasUser UserNotCached
        {
            get
            {
                return getUser( true );
            }
        }

        internal static Guid UserId
        {
            get
            {
                return new Guid(User.Id);
            }
        }
        internal static string UserIdString
        {
            get
            {
                return Context.User.Identity.GetUserId();
            }
        }

        internal static Exception ChooseException( Exception ex, string exceptionMessage )
        {
            return ChooseException(ex, exceptionMessage, ErrorCodes.GeneralError, null);
        }

        internal static Exception ChooseException( Exception ex, string exceptionMessage, string exceptionCode )
        {
            return ChooseException(ex, exceptionMessage, exceptionCode, null);
        }

        internal static Exception ChooseException(Exception ex, string exceptionMessage, string exceptionCode, Hashtable arguments)
        {
            if( Context != null && Context.Items.Contains( "CurrentException" ) )
            {
                return Context.Items[ "CurrentException" ] as Exception;
            }

            StringBuilder sb = new StringBuilder();
            sb.AppendFormat("errorCode={0}", exceptionCode);

            // Check for the logged out exception
            if ( ex.Message.StartsWith( Common.UnauthenticatedMessage ) )
            {
                exceptionMessage = "You have been logged out of MyCanvas. Please log in to continue.";
            }
            string msg = MyCanvasServices.CurrentEnvironment == MyCanvasServices.Environment.LIVE ? exceptionMessage : ex.Message;
            
            sb.AppendFormat( "&errorMessage={0}", msg );

            if (arguments != null)
            {
                foreach (DictionaryEntry d in arguments)
                {
                    sb.AppendFormat("&{0}={1}", d.Key.ToString(), d.Value.ToString());
                }
            }

            Exception newException = new Exception( sb.ToString() );

            if( Context != null )
            {
                Context.Items[ "CurrentException" ] = newException;
            }

            return newException;
        }

        private static MyCanvasUser getAnonymousUser(string anonId)
        {
            MyCanvasUser user = new MyCanvasUser();
            user.FirstName = "Anonymous";
            user.LastName = "User";
            user.Phone = "Anonymous";
            user.UserName = "Anonymous";
            user.Id = anonId;
            return user;
        }

        // TODO: Switch this to read the token through OWIN
        private static MyCanvasUser getUser( bool useCache )
        {
            // Use admin account if this isn't a web context.
            if (Context == null && MyCanvasServices.CurrentEnvironment != MyCanvasServices.Environment.LIVE)
            {
                if (s_adminUser == null)
                {
                    s_adminUser = getUser(AdminUsername, useCache);
                }
                return s_adminUser;
            }

            // Return user from context if present.
            if (Context.Items.Contains(CONTEXT_USER))
            {
                return (MyCanvasUser)Context.Items[CONTEXT_USER];
            }

            // Get authentication token.  
            // First check the OWIN context
            // Second, check the Request variables.
            // Third, use the anonymous Id.
            string uid = Context.Request["uid"];
            if (Context.User.Identity.IsAuthenticated)
            {
                MyCanvasUser u = UserManager.FindById(Context.User.Identity.GetUserId());
                Context.Items[CONTEXT_USER] = u;
                return u;
            }
            if (uid == null)
            {
                return getAnonymousUser(AnonymousIdStr);
            }
            if (uid.StartsWith("anonymous"))
            {
                return getAnonymousUser(uid.Split('=')[1]);
            }

            // the user was not logged in from the cookie but they have the token in the request
            // we need to decrypt the cookie and get the info from it.

            //Switched this to use Jwt rather than the cookie
            //// user this snippit to place the cookie in the flex options
            //// ChunkingCookieManager cookieManager = new ChunkingCookieManager();
            //// cookieManager.GetRequestCookie(Context.GetOwinContext(), ".MCAuth")
            //var user = UserManager.GetClaimsPrincipalFromCookie(uid);

            var user = MyCanvasSignInManager.GetClaimsPrincipalFromJwt(uid);
            return getUser(user.Identity.Name, useCache);
        }

        /// <summary>
        /// The get user.
        /// </summary>
        /// <param name="id">
        /// The id.
        /// </param>
        /// <returns>
        /// The <see cref="MyCanvasUser"/>.
        /// </returns>
        internal static MyCanvasUser GetUser(string id)
        {
            MyCanvasUser user = UserManager.FindById(id);
            //if ( user == null )
            //{
            //    log.Error( "Unable to get user for UserId={ucdmId};", ucdmId );
            //}
            return user;
        }

        private static MyCanvasUser getUser(string username, bool useCache)
        {
            // Return user from cache if desired and if present.
            //if (useCache && Context != null && Context.Session[username] != null)
            //{
            //    return (MyCanvasUser)Context.Session[username];
            //}

            // Get it from the UCDM service and add it to the cache
            MyCanvasUser user = UserManager.FindByName(username);
            if (user == null)
            {
                // Log an error 
                log.Error("Unable to get user for UserName={username},", username);
            }
            else if (Context != null)
            {
                Context.Items[ CONTEXT_USER ] = user;
                //Context.Session[ username ] = user;
            }

            return user;
        }

        public static ProjectData.AccessRight AccessRight
        {
            get
            {
                if (Context == null)
                {
                    return null;
                }

                // If it's already in the context use it
                var right = Context.Items[CONTEXT_ACCESS_RIGHT] as ProjectData.AccessRight;

                if (right == null)
                {
                    // Check the request variables first
                    string accessId = Context.Request["accessId"];

                    // Look in the cookie
                    if (string.IsNullOrEmpty(accessId) && Context.Request.Cookies["access"] != null)
                    {
                        accessId = Context.Request.Cookies["access"].Value;
                    }

                    // If we have an accessId try to decrypt it
                    if (!string.IsNullOrEmpty(accessId) && !Encryptor.Decrypt(accessId, out accessId))
                    {
                        // decryption was unsuccessful
                        accessId = null;
                    }

                    if (!string.IsNullOrEmpty(accessId))
                    {
                        Context.Items[CONTEXT_ACCESS_RIGHT] = right = EditorServices.AccessRights.GetAccessRight(long.Parse(accessId));
                    }
                }

                return right;
            }
        }

        public static void CheckPermissionsForProject(long projectId, bool allowShareAccess)
        {
            var project = EditorServices.Projects.GetProject(projectId);
            if (project != null)
            {
                if (project.CustomerId == UserId)
                {
                    return;
                }

                if (allowShareAccess && project.Active)
                    // Make sure the project hasn't been deleted when using share access
                {
                    // If AccessRight is not null then we use those, otherwise the rights on the project
                    int rights = (int)ShareLevel.None;
                    if (AccessRight != null && AccessRight.ProjectId == project.ProjectId)
                    {
                        rights = AccessRight.Rights;
                    }
                    else
                    {
                        rights = project.ShareLevel;
                    }

                    // Determine if shared based on project share level and user's access token if set.
                    bool shared = (rights & (int)( /* COLLABORATION ShareLevel.ProjectFolderUpload |*/ ShareLevel.Copy | ShareLevel.View)) != (int)ShareLevel.None;
                    if (shared)
                    {
                        return;
                    }
                }
                // If the user is not logged in, throw error to gracefully catch and help them log in.
                else if (!IsAuthenticated)
                {
                    throw new InvalidOperationException(UserErrorCodes.NotLoggedIn);
                }
            }
            throw new UnauthorizedAccessException($"Unauthorized project access by user: {UserId} projectId: {projectId}");
        }

    }
}
