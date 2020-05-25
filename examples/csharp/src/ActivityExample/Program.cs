using Amazon.CDK;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ActivityExample
{
    sealed class Program
    {
        public static void Main(string[] args)
        {
            var app = new App();
            new ActivityExampleStack(app, "ActivityExampleStack");
            app.Synth();
        }
    }
}
