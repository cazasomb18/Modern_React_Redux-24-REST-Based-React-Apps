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

	//We're going to put this reducer together a little bit differently than we have in the past:

	//Reducer Structure Option #1 (this is how we've been doing it)
		//streamsReducer --> [ stream | stream | stream | stream ]
			//stream: { id: 1,  title: 'My stream', description: 'My Stream'}

	//Reducer Structure Option #2 (return object of streams w/ id k-v pairs)
		//streamsReducer --> { 1: stream with ID 1, 22: stream with ID 22, 37: stream with ID 37 }
			//to reference stream: access appropriate ID
				//updating data will be easier as well -- {...state, 65: Stream65}
					//--> syntax will be much easier when using {} instead of an []

	//How much code do we need to write when we're updating records in an array?
		const streamReducer = (state = [], action) => {
			switch (action.type) {
				case EDIT_STREAM:
					return state.map(stream => {
						if (stream.id === action.payload.id) {
							return action.payload;
						} else {
							return stream;
						}
					});
				default:
					return state;
			}
		}; //this what we'd have to do ^^^ to find appropriate stream and edit it w/ arrays
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Key Interpolation Syntax

	//Now let's try to put together an object-based reducer for handling editStream
		const streamReducer = (state={}, action) => {
			switch (action.type) {
				case EDIT_STREAM:
					// const newState = {...state, };
					// newState[action.payload.id] = action.payload;
					// return newState;
					//ALT APPROACH, DOES THE SAME AS ^^^
					return {...state, [action.payload.id]: action.payload};
									//[]: keyinterpolation: we don't know exactly what key we want
									//to add to the {}, we konw action.payload.id is the key we want to add
										//says: look at ID, wahtever it is, take that a create a new key using
										//it in this object, and to that key assign action.payload
				default:
					return state;
			};
		};

	//Here's an example of key interpolation syntax our chrome browser console:
		const animalSounds = { cat: 'meow', dog: 'bark' };
		const animal = 'lion';
		const sound = 'roar';
		{...animalSounds, [animal]: sound }
		// return new object: {cat: "meow", dog: "bark", lion: "roar"}
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Handling, Fetching,  Creating and Updating

	//create reducers/streamReducers.js,
	//import reducer types set up export statement:
		import {
			FETCH_STREAM,
			FETCH_STREAMS, //returns [], fetch and merge w/ state object
			CREATE_STREAM, //return one record, merge w/ state object
			EDIT_STREAM,
			DELETE_STREAM //returns nothing, find appropriate ID and remove k-v pair
		} from '../actions/types';

		export default (state={}, action) => {
			switch (action.type) {
				default:
					return state;
			}
		}

	//case FETCH_STREAM - return one stream
		export default (state={}, action) => {
			switch (action.type) {
				case FETCH_STREAM:
					return { ...state, [action.payload.id]: action.payload };
				default:
					return state;
			}
		}

	//case CREATE_STREAM - add single record to state object:
		export default (state={}, action) => {
			switch (action.type) {
				case CREATE_STREAM:
					return { ...state, [action.payload.id]: action.payload };
				default:
					return state;
			}
		};

	//case EDIT_STREAM - add replace old record in state object with edited record:
		export default (state={}, action) => {
			switch (action.type) {
				case EDIT_STREAM:
					return { ...state, [action.payload.id]: action.payload };
				default:
					return state;
			}
		};
	//*** NOTICE THAT THE SYNTAX FOR EDIT, CREATE AND FETCH ARE EXACTLY THE SAME:
		//WE'RE GETTING BACK A SINGLE RECORD FROM OUT API, WE WANT TO TAKE THAT RECORD AND ADD
		//IT INTO OUR STATE OBJECT
			//--> EXACTLY THE SAME FOR EDITING, CREATING AND FETCHING	
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Deleting Properties with Omit

	//Deleting a record: we're going to use the lodash lib to get some funcitonality out of OMIT
	//When we delete, an action creator is dispatching an action w/ the ID on the payload prop

	//Install lodash: npm install --save lodash

	//src/reducers/streamReducer.js:
	//STREAM_DELETE: deleting a record

	export default (state={}, action) => {
			switch (action.type) { 
			case DELETE_STREAM:
				return _.omit(state, action.payload);
	};

	//Let's look at the action for this reducer:
		export const deleteStream = (id) => async dispatch => {
			await streams.delete(`/streams/${id}`);
			dispatch({ type: DELETE_STREAM, payload: id });
				//since we're dispatching 'payload: id', we already have the id we want to reference
					//therefore we just omit the action.payload (entire record)
	};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Merging Lists of Records

	//GOAL: take an array of streams and merge them into our state object
		//BECAUSE we have a state object we're going to have to figure out a better method

	//We're going to use mapKeys() which is from the lodash lib:
		//takes an [] and return an {}

		//Arr Input:
			[
				{id: 12, title: 'my stream', description: 'my stream'}, 
				{id: 45, title: 'my stream', description: 'my stream'},
				{id: 125, title: 'my stream', description: 'my stream'}
			]
		//Object output: w/ mapKeys(streams, 'id');
			{
				{ 12: { id: 12, title: 'my stream', description: 'my stream' } },
				{ 45: { id: 45, title: 'my stream', description: 'my stream' } },
				{ 125: { id: 125, title: 'my stream', description: 'my stream' } }
			}
			//mapKeys(): takes and array and return an object
				//keys will be taken from each individual record inside of an array:
					//the value for each id becomes the key for each record

	//Quick example in stephengrider.github.io/playgrounds:
		const colors = [
		  { hue: 'green' },
		  { hue: 'yellow'},
		  { hue: 'blue' }
		];

		_.mapKeys(colors, 'hue');
		//.mapKeys(): lodash function
			//(colors): [] we're targeting
			//('hue'): key whose value will become the new key in {} returned

		//returns this new object:
		{ 
			"green": { "hue":"green"},
			"yellow":{ "hue":"yellow" },
			"blue": { "hue":"blue" }

		};
	//Exactly same just w/ id "numbers" instead of strings as the keys:

	const data = [
	  { id: 3 },
	  { id: 5 },
	  { id: 7 }
	];

	_.mapKeys(data, 'id');
	//.mapKeys(): lodash function
			//(data): [] we're targeting
			//('id'): key whose value will become the new key in {} returned

	​//returns this new object: 
	{
		"3":{"id":3},
		"5":{"id":5},
		"7":{"id":7}
	};
	//We're taking array of strings from the api
		[data]
	//then adding them into an an object 
		_.mapKeys(data, 'id');
	//finally we're adding this into our state object

	//So let's try to set this up in our StreamReducer.js (src/reducers/):
		import _ from 'lodash';//import lodash lib

		export default (state={}, action) => {
		switch (action.type) {
			case FETCH_STREAMS:
				return { ...state, ..._.mapKeys(action.payload, 'id') };
			default:
			return state;
			};
		};		
	//Walkthrough of that new syntax: return { ...state, ..._.mapKeys(action.payload, 'id') };
		//{
			//'...state,' --> new {} w/ all current state and adding them in
			//'..._.mapKeys(action.payload' --> calling mayKeys on the list of streams just returned from API
			//', "id" )' --> create an object out of it using the 'id' prop value as the key for each record 
		//}

	//Now we have to wire it up to our reducers/index.js, and export it to our redux store:
		import { combineReducers } from 'redux';
		import { reducer as formReducer } from 'redux-form';

		import authReducer from './authReducer'
		import streamReducer from './streamReducer';//import reducer

		export default combineReducers({
			auth: authReducer,
			form: formReducer, 
			streams: streamReducer //add as new prop in combineReducers({}) call:
		});

	//Check out the state in redux dev tools:
		//{
			//auth: { isSignedIn: true, userId: '23890734020213984759832' },
			//form: { streamCreate: { syncErrors: {...}, registeredFields: {...} },
			//streams: {  }
		//}
	//We now have a new empty object with a key of 'streams'!

	//src/reducers/streamReducers.js now looks like this:
		import _ from 'lodash';
		import {
			FETCH_STREAM,
			FETCH_STREAMS,
			CREATE_STREAM,
			EDIT_STREAM,
			DELETE_STREAM
		} from '../actions/types';

		export default (state={}, action) => {
			switch (action.type) {
				case FETCH_STREAMS:
					return { ...state, ..._.mapKeys(action.payload, 'id') };
				case FETCH_STREAM:
					return { ...state, [action.payload.id]: action.payload };
				case CREATE_STREAM:
					return { ...state, [action.payload.id]: action.payload };
				case DELETE_STREAM:
					return _.omit(state, action.payload);
				default:
					return state;
			}
		}
	//src/reducers/index.js now looks like this:
		import { combineReducers } from 'redux';
		import { reducer as formReducer } from 'redux-form';

		import authReducer from './authReducer'
		import streamReducer from './streamReducer';

		export default combineReducers({
			auth: authReducer,
			form: formReducer, 
			streams: streamReducer
		});
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Fetching a List of All Streams

	//Now that we've got our streamReducer hooked up, it's now time to test it
	//To test we'll wire up an AC call to our StreamList component, we need to call right AC:

	//StreamList.js:
		import React from 'react';
		import { connect } from 'react-redux';
		import { fetchStreams } from '../../actions'; //import fetchStreams AC

		class StreamList extends React.Component { //change to class component
			componentDidMount(){
				this.props.fetchStreams();//call AC in CDM
			}

			render(){
				return <div>StreamList</div>
			}
		};

		export default connect(//wire up connect with init state and AC as args in 1st ()
			null, 
			{ fetchStreams }
		)(StreamList);//component we're connecting the AC and state as arg in 2nd ()

	//So now when you navigate to 'localhost:3000/' check redux dev tools:
		//state now has 2 records inside of 'streams':
			//streams: 
			//{
				//1 {title: 'title', description: 'sumdesc', id: 1},
				//2 {title: 'title', description: 'sumdesc', id: 2}
			//}
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Rendering All Streams:
	
	//Let's render out the streams in StreamList to reflect what our wireframe shows:
	//StreamList.js:
		const mapStateToProps = (state) => {
			return { streams:  Object.values(state.streams) };
			//Object.values() --> turns all values inside of object into an array
				//array mutations are easier at this level
				//data is now available at this.props.streams
		};

		export default connect(
			mapStateToProps, //DON'T FORGET TO WIRE UP mapStateToProps!
			{ fetchStreams }
		)(StreamList);

	//Console.log the new data to see what we're working with:
		render(){
			console.log(this.props.streams);
		}

	//So now that we have that data let's render out a list!
		renderList(){
			return this.props.streams.map(stream => {
				return (
					<div className="item" key={stream.id}>
						<i className="large middle aligned icon camera" />
						<div className="content">
						{stream.title}
							<div className="description">{stream.description}</div>
						</div>
					</div>
				);
			})
		}

	//Now let's make sure we render this in our component's return statement:
		render(){
			return (
				<div>
					<h2>Streams</h2>
					<div className="ui celled list">
						{this.renderList()}
					</div>
				</div>
			); 
		};
	//Entire StreamList.js component now looks like this:
		import React from 'react';
		import { connect } from 'react-redux';

		import { fetchStreams } from '../../actions';

		class StreamList extends React.Component {
			componentDidMount(){
				this.props.fetchStreams();
			}
			renderList(){
				return this.props.streams.map(stream => {
					return (
						<div className="item" key={stream.id}>
							<i className="large middle aligned icon camera" />
							<div className="content">
							{stream.title}
								<div className="description">{stream.description}</div>
							</div>
						</div>
					);
				})
			}
			render(){
				return (
					<div>
						<h2>Streams</h2>
						<div className="ui celled list">
							{this.renderList()}
						</div>
					</div>
				); 
			}
		};
		const mapStateToProps = state => {
			return { streams:  Object.values(state.streams) };
		};
		export default connect(
			mapStateToProps, 
			{ fetchStreams }
		)(StreamList);
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Associating Streams with Users



















