On the frontend: 
In my @AiChatModal.tsx @StudentAiChat.tsx, using @ai-chat.store.ts and @student-ai.api.ts , with related components: @ToolResponseRouter.tsx @Message.tsx @CreateFeatureResponseCard.tsx  (types: @database.types.ts ), I have a chat assistnat that utilized an ai agent that has a create_feature tool. 

It talks to the following backend files: @index.ts , and @app.py @main.py @base.py @create_feature.py . 

I'm looking to use this skaffolding I've created around one tool and implement many more tools for my ai agent that help people navigate and execute actions on my app like: 
For students:
- get project info and details
- get validation and testing progress
- see recent activity
- add a tester to a feature
- create a new project
- get feature details
For admin
- get an overview of all ongoing projects, validations, tests, and students and testers
- get specific info about projects
- get speciigc info about students
- get specific info about testers
- get recent activity details
- get info about the test history
- create tickets
For testers
- get details on their testing queue
- get detials on their testing history
- get metric details
- get feature deatail for features in their queue

I also have a large collection of backend edge functions that can do a majority of these tasks in @functions(with types:@database.types.ts ) folder. 

I'm looking to create tools on my python microservice in @s-black-ai-python-service that can be utilized by my langchain agent that answers user queries from the frontend AI Chat assistant by calling the backend edge functions. 

Can you understand my request and codebase to be able to think up a good plan to execute this? 

I'm hoping that you can lay out an entire plan that i can give to my software engineer for them to implement to achieve the goal of having an ai agent with that toolset that interacts with my current backend functions to give my website full ai assistant capabilities. 