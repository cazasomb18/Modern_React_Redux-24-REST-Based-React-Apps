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
		//get one particulr record 		GET 			/streams/:id
		//create record 				POST 			/streams
		//update a record 				PUT 			/streams/:id
		//delete a record 				DELETE 			/streams/:id
////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
//Setting up an API Server

	//in terminal, create new directory, streams/api:
		//in api: 'npm init' enter through questions
			//'npm install --save json-server'
				//--> now open in code editor

	//create npm/db.json:
		//this will be serving as our DATABASE!!

	//package.json: "scripts": delete "test" and replace with:
	"start": "json-server -p 3001 -w db.json"
		//when you run "npm start:
			//json-server starts on port:3001 
			//watches db.json file for changes

	//Now close all api code editor files and run "npm start"
		//server up and running - watching db.json for changes

	//We can make use of this server by following all the RESTful conventions
		//all streams GET /streams
		//create record POST /streams
		//get one record GET /streams/:id
		//update a record PUT /streams/:id
		//delete a record DELETE /streams/:id
////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////////////////////////
//Creating Streams Through Action Creators

	//need to make a newtwork request to our api on localhost:3001
		//make action creator
		//wire ac creator to connect helper
		//call ac from onSubmit
		//ac will use axios to make the api network request

	//in client: npm install --save axios redux-thunk
		//installing dependencies necessary for making an axios network api request

	//create src/apis/streams.js:
		//import axios / export default base url:
			import axios from 'axios';

			export default axios.create({
				baseURL: 'http://localhost:3001/'
			})

	//src/actions/index.js: import axios instance:
		import streams from '../apis/streams';

	//let's create a new action creator to handle this handle an axios request to the api:
		export const createStream = formValues => async dispatch => {
		 	streams.post('/streams', formValues);
		 		//making req. to localhost:3001
		 		//passing in all form values
		};

	//Now let's make sure we can successfully create a new stream:

	//src/components/streams/StreamCreate.js:
		import { connect } from 'react-redux'; //connect()()
		import { createStream } from '../../actions'; //action creator

	//But when we got to export we have already exported reduxForm in the same way...
		export default reduxForm({
			form: 'streamCreate', 
			validate: validate
		})(StreamCreate);
			//--> we'll deal w/ this next...
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Creating a Stream with REST Conventions

	//Wire up action creator to our component... the syntax will look a little bit nasty...

	//To avoid this we'll create a var 'formWrapped' and export it within connect()()
	//src/components/streams/CreateStream.js:
		const formWrapped = reduxForm({
			form: 'streamCreate', 
			validate: validate
		})(StreamCreate);//this how we can stack on different action creators and components

		export default connect(null, { createStream })(formWrapped);

	//We actually forgot to import redux-thunk and wire it up!  So let's do that real quickly!
	//in client directory run command 'npm install --save axios npm redux-thunk'
	//src/index/js:
		import reduxThunk from 'redux-thunk';//import reduxThunk

		const store = createStore(
		reducers,
			composeEnhancers(applyMiddleware(reduxThunk))//call as arg w/ applyMiddleware
		);

	//NOW TEST IT OUT!
		//enter some data into the fields and slick submit:
			//console network status === 201 - good - but did it really go through?
			//terminal dir streams/api: run 'cat db.json' terminal returns w/ data from db.json:
				{
				  "streams": [
				    {
				      "title": "My Stream",
				      "description": "This is a GREAT STREAM!",
				      "id": 1
				    }
				  ]
				}
					//successfully req to 'dummy' json-server api
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Dispatching Actions After StreamCreate

	//src/actions/index.js:
		export const createStream = formValues => async dispatch => {
		 	const response = await streams.post('/streams', formValues);
		 	//add await part of async/await syntax ^^^
		};
	//src/actions/types: 
		export const CREATE_STREAM = 'CREATE_STREAM';//now add the type

	//src/actions/index.js:
		import { SIGN_IN, SIGN_OUT, CREATE_STREAM } from './types';//add action type to import
		export const createStream = formValues => async dispatch => {
		 	const response = await streams.post('/streams', formValues);
		 	dispatch({ type: CREATE_STREAM, payload: response.data });
		 		//now dispatch the action CREATE_STREAM, w/ payload: response.data
		};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Bulk Action Creators

	//src/actions/types:
		export const SIGN_IN = 'SIGN_IN';
		export const SIGN_OUT = 'SIGN_OUT';
		export const CREATE_STREAM = 'CREATE_STREAM';
		export const FETCH_STREAMS = 'FETCH_STREAMS';
		export const FETCH_STREAM = 'FETCH_STREAM';
		export const DELETE_STREAM = 'DELETE_STREAM';
		export const EDIT_STREAM = 'EDIT_STREAM'; 
			//create all types for each route following RESTful conventions

	//src/actions/index.js:
		import { SIGN_IN, 
				SIGN_OUT, 
				CREATE_STREAM,
				FETCH_STREAMS,
				FETCH_STREAM,
				DELETE_STREAM,
				EDIT_STREAM 
		} from './types';//import all types

	//let's try putting together an action for one of our most basic actions: FETCH_STREAMS:
		export const fetchStreams = () => async dispatch => {
			const response = await streams.get('/streams');
			dispatch({ type: FETCH_STREAMS, payload: respose.data });
		};

	//this action needs to have the id value interpolated into the route:
		export const fetchStream = (id) => async dispatch => {
			const response = await streams.get(`/streams/${id}`);//int. id
			dispatch({ type: FETCH_STREAM, payload: respose.data });
		};

	//edit is a bit more challenging b/c you have to provide the id && formValues:
	export const editSTream = (id, formValues) => async dispatch => {
		const response = await streams.put(`/streams/${id}`, formValues);
		dispatch({ type: EDIT_STREAM, payload: respose.data });
	};

	//delete is different b/c there's no reponse:
		export const deleteStream = (id) => async dispatch => {
			await streams.delete(`/streams/${id}`);

			dispatch({ type: DELETE_STREAM, payload: id });
			//we're dispatching the id of the stream we just tried to delete
		};
////////////////////////////////////////////////////////////////////////////////////////////////////
//Object-Based Reducers		













