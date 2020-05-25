using Amazon.CDK;
using Get2Know.CDK.TwitterActivity;

namespace ActivityExample
{
    public class ActivityExampleStack : Stack
    {
        internal ActivityExampleStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
            new EventSource(this, "ActivityEventSource");
        }
    }
}
