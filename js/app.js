////////////////////////////////////////////////////////////////////////////////////////////////////
//Creating Streams

	//What are we doing once user submits the form?

	//We're going to focus on the overall architecure of our project:

	//Remember this diagram (appArchitecture.png)?
										//APIServer that knows
										//which streams are
										//broadcasting		--> [Viewer's Browser]
//											^^^					[ReactApp that can] 
//											^^^					[create and browse] 
//											^^^						[streams]	
	//Streamer's Computer: running OBS --> [RTMP Server] 	<-- [Viewer's Browser]
//		creating stream: id 2			show me streamid: 2


	//API Server: has a plain list of records, each record will represent one stream:
		// {id: 1, title: 'My Stream', description: 'some stream'}
		// {id: 2, title: 'Code Stream', description: 'Coding'}

	//Streamer running OBS: I am creating stream id 2
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//REST-ful Conventions

	//We're going to have to start working on the API Server
		//documentation: npmjs.com/package/json-server/

		//ACTION 					METHOD 			ROUTE
		//list all records				GET 		 	/streams
		//get one particulr record 		GET 			/streams/id
		//create record 				POST 			/streams
		//update a record 				PUT 			/streams/id
		//delete a record 				DELETE 			/streams/id