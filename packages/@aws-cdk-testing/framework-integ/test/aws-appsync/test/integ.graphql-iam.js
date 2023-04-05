"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const aws_cognito_1 = require("aws-cdk-lib/aws-cognito");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_appsync_1 = require("aws-cdk-lib/aws-appsync");
/*
 * Creates an Appsync GraphQL API and Lambda with IAM Roles.
 * Testing for IAM Auth and grantFullAccess.
 *
 * Stack verification steps:
 * Install dependencies and deploy integration test. Invoke Lambda
 * function with different permissions to test policies.
 *
 * -- bash verify.integ.graphql-iam.sh --start             -- get dependencies/deploy    --
 * -- aws lambda list-functions                            -- obtain testFail/testQuery  --
 * -- aws lambda invoke /dev/stdout --function-name [FAIL] -- fails beacuse no IAM Role` --
 * -- aws lambda invoke /dev/stdout --function-name [Query]-- succeeds with empty get  ` --
 * -- bash verify.integ.graphql-iam.sh --clean             -- clean dependencies/deploy  --
 */
const app = new aws_cdk_lib_1.App();
const stack = new aws_cdk_lib_1.Stack(app, 'aws-appsync-integ');
const userPool = new aws_cognito_1.UserPool(stack, 'Pool', {
    userPoolName: 'myPool',
});
const api = new aws_appsync_1.GraphqlApi(stack, 'Api', {
    name: 'Integ_Test_IAM',
    schema: aws_appsync_1.SchemaFile.fromAsset((0, path_1.join)(__dirname, 'integ.graphql-iam.graphql')),
    authorizationConfig: {
        defaultAuthorization: {
            authorizationType: aws_appsync_1.AuthorizationType.USER_POOL,
            userPoolConfig: {
                userPool,
                defaultAction: aws_appsync_1.UserPoolDefaultAction.ALLOW,
            },
        },
        additionalAuthorizationModes: [
            {
                authorizationType: aws_appsync_1.AuthorizationType.IAM,
            },
        ],
    },
});
const testTable = new aws_dynamodb_1.Table(stack, 'TestTable', {
    billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
    partitionKey: {
        name: 'id',
        type: aws_dynamodb_1.AttributeType.STRING,
    },
    removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
});
const testDS = api.addDynamoDbDataSource('ds', testTable, { name: 'testDataSource' });
testDS.createResolver('QueryGetTest', {
    typeName: 'Query',
    fieldName: 'getTest',
    requestMappingTemplate: aws_appsync_1.MappingTemplate.dynamoDbGetItem('id', 'id'),
    responseMappingTemplate: aws_appsync_1.MappingTemplate.dynamoDbResultItem(),
});
testDS.createResolver('QueryGetTests', {
    typeName: 'Query',
    fieldName: 'getTests',
    requestMappingTemplate: aws_appsync_1.MappingTemplate.dynamoDbScanTable(),
    responseMappingTemplate: aws_appsync_1.MappingTemplate.dynamoDbResultList(),
});
testDS.createResolver('MutationAddTest', {
    typeName: 'Mutation',
    fieldName: 'addTest',
    requestMappingTemplate: aws_appsync_1.MappingTemplate.dynamoDbPutItem(aws_appsync_1.PrimaryKey.partition('id').auto(), aws_appsync_1.Values.projecting('test')),
    responseMappingTemplate: aws_appsync_1.MappingTemplate.dynamoDbResultItem(),
});
const lambdaIAM = new aws_iam_1.Role(stack, 'LambdaIAM', { assumedBy: new aws_iam_1.ServicePrincipal('lambda') });
api.grant(lambdaIAM, aws_appsync_1.IamResource.custom('types/Query/fields/getTests'), 'appsync:graphql');
api.grant(lambdaIAM, aws_appsync_1.IamResource.ofType('test'), 'appsync:GraphQL');
api.grantMutation(lambdaIAM, 'addTest');
new aws_lambda_1.Function(stack, 'testQuery', {
    code: aws_lambda_1.Code.fromAsset((0, path_1.join)(__dirname, 'verify/iam-query')),
    handler: 'iam-query.handler',
    runtime: aws_lambda_1.Runtime.NODEJS_14_X,
    environment: { APPSYNC_ENDPOINT: api.graphqlUrl },
    role: lambdaIAM,
});
new aws_lambda_1.Function(stack, 'testFail', {
    code: aws_lambda_1.Code.fromAsset((0, path_1.join)(__dirname, 'verify/iam-query')),
    handler: 'iam-query.handler',
    runtime: aws_lambda_1.Runtime.NODEJS_14_X,
    environment: { APPSYNC_ENDPOINT: api.graphqlUrl },
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcuZ3JhcGhxbC1pYW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZy5ncmFwaHFsLWlhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUE0QjtBQUM1Qix5REFBbUQ7QUFDbkQsMkRBQTZFO0FBQzdFLGlEQUE2RDtBQUM3RCx1REFBaUU7QUFDakUsNkNBQXdEO0FBQ3hELHlEQVNpQztBQUVqQzs7Ozs7Ozs7Ozs7OztHQWFHO0FBRUgsTUFBTSxHQUFHLEdBQUcsSUFBSSxpQkFBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxtQkFBSyxDQUFDLEdBQUcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xELE1BQU0sUUFBUSxHQUFHLElBQUksc0JBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0lBQzNDLFlBQVksRUFBRSxRQUFRO0NBQ3ZCLENBQUMsQ0FBQztBQUVILE1BQU0sR0FBRyxHQUFHLElBQUksd0JBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0lBQ3ZDLElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsTUFBTSxFQUFFLHdCQUFVLENBQUMsU0FBUyxDQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQzFFLG1CQUFtQixFQUFFO1FBQ25CLG9CQUFvQixFQUFFO1lBQ3BCLGlCQUFpQixFQUFFLCtCQUFpQixDQUFDLFNBQVM7WUFDOUMsY0FBYyxFQUFFO2dCQUNkLFFBQVE7Z0JBQ1IsYUFBYSxFQUFFLG1DQUFxQixDQUFDLEtBQUs7YUFDM0M7U0FDRjtRQUNELDRCQUE0QixFQUFFO1lBQzVCO2dCQUNFLGlCQUFpQixFQUFFLCtCQUFpQixDQUFDLEdBQUc7YUFDekM7U0FDRjtLQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBRUgsTUFBTSxTQUFTLEdBQUcsSUFBSSxvQkFBSyxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUU7SUFDOUMsV0FBVyxFQUFFLDBCQUFXLENB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VXNlclBvb2wgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY29nbml0byc7XG5pbXBvcnQgeyBBdHRyaWJ1dGVUeXBlLCBCaWxsaW5nTW9kZSwgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0IHsgUm9sZSwgU2VydmljZVByaW5jaXBhbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0IHsgQ29kZSwgRnVuY3Rpb24sIFJ1bnRpbWUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IEFwcCwgUmVtb3ZhbFBvbGljeSwgU3RhY2sgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQge1xuICBBdXRob3JpemF0aW9uVHlwZSxcbiAgR3JhcGhxbEFwaSxcbiAgTWFwcGluZ1RlbXBsYXRlLFxuICBQcmltYXJ5S2V5LFxuICBVc2VyUG9vbERlZmF1bHRBY3Rpb24sXG4gIFZhbHVlcyxcbiAgSWFtUmVzb3VyY2UsXG4gIFNjaGVtYUZpbGUsXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcHBzeW5jJztcblxuLypcbiAqIENyZWF0ZXMgYW4gQXBwc3luYyBHcmFwaFFMIEFQSSBhbmQgTGFtYmRhIHdpdGggSUFNIFJvbGVzLlxuICogVGVzdGluZyBmb3IgSUFNIEF1dGggYW5kIGdyYW50RnVsbEFjY2Vzcy5cbiAqXG4gKiBTdGFjayB2ZXJpZmljYXRpb24gc3RlcHM6XG4gKiBJbnN0YWxsIGRlcGVuZGVuY2llcyBhbmQgZGVwbG95IGludGVncmF0aW9uIHRlc3QuIEludm9rZSBMYW1iZGFcbiAqIGZ1bmN0aW9uIHdpdGggZGlmZmVyZW50IHBlcm1pc3Npb25zIHRvIHRlc3QgcG9saWNpZXMuXG4gKlxuICogLS0gYmFzaCB2ZXJpZnkuaW50ZWcuZ3JhcGhxbC1pYW0uc2ggLS1zdGFydCAgICAgICAgICAgICAtLSBnZXQgZGVwZW5kZW5jaWVzL2RlcGxveSAgICAtLVxuICogLS0gYXdzIGxhbWJkYSBsaXN0LWZ1bmN0aW9ucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLSBvYnRhaW4gdGVzdEZhaWwvdGVzdFF1ZXJ5ICAtLVxuICogLS0gYXdzIGxhbWJkYSBpbnZva2UgL2Rldi9zdGRvdXQgLS1mdW5jdGlvbi1uYW1lIFtGQUlMXSAtLSBmYWlscyBiZWFjdXNlIG5vIElBTSBSb2xlYCAtLVxuICogLS0gYXdzIGxhbWJkYSBpbnZva2UgL2Rldi9zdGRvdXQgLS1mdW5jdGlvbi1uYW1lIFtRdWVyeV0tLSBzdWNjZWVkcyB3aXRoIGVtcHR5IGdldCAgYCAtLVxuICogLS0gYmFzaCB2ZXJpZnkuaW50ZWcuZ3JhcGhxbC1pYW0uc2ggLS1jbGVhbiAgICAgICAgICAgICAtLSBjbGVhbiBkZXBlbmRlbmNpZXMvZGVwbG95ICAtLVxuICovXG5cbmNvbnN0IGFwcCA9IG5ldyBBcHAoKTtcbmNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKGFwcCwgJ2F3cy1hcHBzeW5jLWludGVnJyk7XG5jb25zdCB1c2VyUG9vbCA9IG5ldyBVc2VyUG9vbChzdGFjaywgJ1Bvb2wnLCB7XG4gIHVzZXJQb29sTmFtZTogJ215UG9vbCcsXG59KTtcblxuY29uc3QgYXBpID0gbmV3IEdyYXBocWxBcGkoc3RhY2ssICdBcGknLCB7XG4gIG5hbWU6ICdJbnRlZ19UZXN0X0lBTScsXG4gIHNjaGVtYTogU2NoZW1hRmlsZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICdpbnRlZy5ncmFwaHFsLWlhbS5ncmFwaHFsJykpLFxuICBhdXRob3JpemF0aW9uQ29uZmlnOiB7XG4gICAgZGVmYXVsdEF1dGhvcml6YXRpb246IHtcbiAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5VU0VSX1BPT0wsXG4gICAgICB1c2VyUG9vbENvbmZpZzoge1xuICAgICAgICB1c2VyUG9vbCxcbiAgICAgICAgZGVmYXVsdEFjdGlvbjogVXNlclBvb2xEZWZhdWx0QWN0aW9uLkFMTE9XLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGFkZGl0aW9uYWxBdXRob3JpemF0aW9uTW9kZXM6IFtcbiAgICAgIHtcbiAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IEF1dGhvcml6YXRpb25UeXBlLklBTSxcbiAgICAgIH0sXG4gICAgXSxcbiAgfSxcbn0pO1xuXG5jb25zdCB0ZXN0VGFibGUgPSBuZXcgVGFibGUoc3RhY2ssICdUZXN0VGFibGUnLCB7XG4gIGJpbGxpbmdNb2RlOiBCaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gIHBhcnRpdGlvbktleToge1xuICAgIG5hbWU6ICdpZCcsXG4gICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gIH0sXG4gIHJlbW92YWxQb2xpY3k6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcbn0pO1xuXG5jb25zdCB0ZXN0RFMgPSBhcGkuYWRkRHluYW1vRGJEYXRhU291cmNlKCdkcycsIHRlc3RUYWJsZSwgeyBuYW1lOiAndGVzdERhdGFTb3VyY2UnIH0pO1xuXG50ZXN0RFMuY3JlYXRlUmVzb2x2ZXIoJ1F1ZXJ5R2V0VGVzdCcsIHtcbiAgdHlwZU5hbWU6ICdRdWVyeScsXG4gIGZpZWxkTmFtZTogJ2dldFRlc3QnLFxuICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZHluYW1vRGJHZXRJdGVtKCdpZCcsICdpZCcpLFxuICByZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmR5bmFtb0RiUmVzdWx0SXRlbSgpLFxufSk7XG5cbnRlc3REUy5jcmVhdGVSZXNvbHZlcignUXVlcnlHZXRUZXN0cycsIHtcbiAgdHlwZU5hbWU6ICdRdWVyeScsXG4gIGZpZWxkTmFtZTogJ2dldFRlc3RzJyxcbiAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmR5bmFtb0RiU2NhblRhYmxlKCksXG4gIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZHluYW1vRGJSZXN1bHRMaXN0KCksXG59KTtcblxudGVzdERTLmNyZWF0ZVJlc29sdmVyKCdNdXRhdGlvbkFkZFRlc3QnLCB7XG4gIHR5cGVOYW1lOiAnTXV0YXRpb24nLFxuICBmaWVsZE5hbWU6ICdhZGRUZXN0JyxcbiAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmR5bmFtb0RiUHV0SXRlbShQcmltYXJ5S2V5LnBhcnRpdGlvbignaWQnKS5hdXRvKCksIFZhbHVlcy5wcm9qZWN0aW5nKCd0ZXN0JykpLFxuICByZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmR5bmFtb0RiUmVzdWx0SXRlbSgpLFxufSk7XG5cbmNvbnN0IGxhbWJkYUlBTSA9IG5ldyBSb2xlKHN0YWNrLCAnTGFtYmRhSUFNJywgeyBhc3N1bWVkQnk6IG5ldyBTZXJ2aWNlUHJpbmNpcGFsKCdsYW1iZGEnKSB9KTtcblxuXG5hcGkuZ3JhbnQobGFtYmRhSUFNLCBJYW1SZXNvdXJjZS5jdXN0b20oJ3R5cGVzL1F1ZXJ5L2ZpZWxkcy9nZXRUZXN0cycpLCAnYXBwc3luYzpncmFwaHFsJyk7XG5hcGkuZ3JhbnQobGFtYmRhSUFNLCBJYW1SZXNvdXJjZS5vZlR5cGUoJ3Rlc3QnKSwgJ2FwcHN5bmM6R3JhcGhRTCcpO1xuYXBpLmdyYW50TXV0YXRpb24obGFtYmRhSUFNLCAnYWRkVGVzdCcpO1xuXG5uZXcgRnVuY3Rpb24oc3RhY2ssICd0ZXN0UXVlcnknLCB7XG4gIGNvZGU6IENvZGUuZnJvbUFzc2V0KGpvaW4oX19kaXJuYW1lLCAndmVyaWZ5L2lhbS1xdWVyeScpKSxcbiAgaGFuZGxlcjogJ2lhbS1xdWVyeS5oYW5kbGVyJyxcbiAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTRfWCxcbiAgZW52aXJvbm1lbnQ6IHsgQVBQU1lOQ19FTkRQT0lOVDogYXBpLmdyYXBocWxVcmwgfSxcbiAgcm9sZTogbGFtYmRhSUFNLFxufSk7XG5uZXcgRnVuY3Rpb24oc3RhY2ssICd0ZXN0RmFpbCcsIHtcbiAgY29kZTogQ29kZS5mcm9tQXNzZXQoam9pbihfX2Rpcm5hbWUsICd2ZXJpZnkvaWFtLXF1ZXJ5JykpLFxuICBoYW5kbGVyOiAnaWFtLXF1ZXJ5LmhhbmRsZXInLFxuICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xNF9YLFxuICBlbnZpcm9ubWVudDogeyBBUFBTWU5DX0VORFBPSU5UOiBhcGkuZ3JhcGhxbFVybCB9LFxufSk7XG5cbmFwcC5zeW50aCgpO1xuIl19