//using System;
//using System.Threading;
//using ComBiz.Client.Library.WebAncestry;

//namespace MyCanvas.Editor.AppCode.Ancestry
//{
//    public enum Status
//    {
//        Running,
//        Succeeded,
//        Failed,
//    }

//    [Serializable]
//    public class GetFamilyCall
//    {
//        public Status Status = Status.Running;
//        public FamilyInfo Family;
//        public int ThreadId;

//        public GetFamilyCall()
//        {
//        }

//        public bool SetStatus( Status status )
//        {
//            if( ThreadId == Thread.CurrentThread.ManagedThreadId )
//            {
//                Status = status;
//                return true;
//            }

//            return false;
//        }
//    }
//}
