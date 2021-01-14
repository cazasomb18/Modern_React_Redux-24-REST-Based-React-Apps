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

	//GOAL: we want to show some 'EDIT' 'DELETE' buttons on each stream that USER created

	//good tie in for fetchingstreams and authentication

	//we need to attach a user id to the streams that get created
		//when we create a stream object we need to attach a userId prop to that object
			//we'll get the userId from auth piece of state

	//actions/index.js:
		export const createStream = formValues => async dispatch => {
	 	const response = await streams.post('/streams', formValues);
			//want to take formValues{} and user's userId and post it to our streams endpoint
	 	dispatch({ type: CREATE_STREAM, payload: response.data });
	};

	//We need to get userId, inside of our ActionCreator (createStream)
	//When we return a function from an AC, the 
		//function gets automatically gets called w/ ReduxThunk w/ 2 arguments:
			//1st arg: dispatch funciton
			//2nd arg: getState function
				//--> allows us to reach into ReduxSTore and pull out some function

	//src/actions/index.js:
	export const createStream = formValues => async (dispatch, getState) => {
		const { userId } = getState().auth;
		//extract our userId from redux store auth object:
	 	const response = await streams.post('/streams', { ...formValues, userId });
											//new {} w/ all formValues adding userId as a prop
	 	dispatch({ type: CREATE_STREAM, payload: response.data });
	};

	//Now navigate to 'localhost:3000/streams/new' in browser console, fill in fields:
		//we just created a new stream with a new key 'userId: 23409785409230'

	//Next we'll use the userId to determine whether or not we render the 'EDIT'/'DELETE' buttons
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Conditionally Showing Edit and Delete

	//GOAL: use the userId to determine whether or not we render the 'EDIT'/'DELETE' buttons

	//StreamList.js:
		const mapStateToProps = state => {
			return {
				streams:  Object.values(state.streams),
				currentUserId: state.auth.userId //storing currentUserId in state from auth{}
			};
		}

	//now above renderList(){}, let's add a helper method to make the code easier to read, and keep it away
	//from this already complicated mapping function:
		renderAdmin(stream){
			if (stream.userId === this.props.currentUserId) {//this stream's userId === currentUserId
				return <div>EDIT/DELETE</div>;//render div w/ edit/delete
			}
		}

	//Now let's call this in renderList(){} method:
		renderList(){
			return this.props.streams.map(stream => {
				return (
					<div className="item" key={stream.id}>
						<i className="large middle aligned icon camera" />
						<div className="content">
						{stream.title}
							<div className="description">{stream.description}</div>
						</div>
						{this.renderAdmin(stream)}
						{/*call renderAdmin helper method to render edit/del div*/}
					</div>
				);
			})
		};

	//Let's add a little bit of styling now:
		renderAdmin(){
			if (stream.userId === this.props.currentUserId) {
				return (
					<div className="right floated content">
						<button className="ui button primary">EDIT</button>
						<button className="ui button negative">DELETE</button>
								{/*"negative" renders button in red as warning to users*/}
					</div>
				);
			}
		}
		renderList(){
			return this.props.streams.map(stream => {
				return (
					<div className="item" key={stream.id}>
						{this.renderAdmin(stream)}
						{/*this has to be here for semantic ui styling to work*/}
						<i className="large middle aligned icon camera" />
						<div className="content">
						{stream.title}
							<div className="description">{stream.description}</div>
						</div>
					</div>
				);
			})
		}
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Linking to Stream Creation

	//We need to make sure IF user's logged in we show a button 'CreateStream'
		//need to set up to nav to CreateStream.js page:

	//StreamList.js:
		//import <Link/>:
			import { Link } from 'react-router-dom';
		//add isSignedIn from app level state to component level state in mapStateToProps:
			const mapStateToProps = state => {
				return {
					streams:  Object.values(state.streams),
					currentUserId: state.auth.userId,
					isSignedIn: state.auth.isSignedIn
				};
			}
		//create new helper method to render 'Create Stream' button:
			renderCreate(){
				if (this.props.isSignedIn) {
					return (
						<div style={{ textAlign: right }}>
							{/*inline styline: alligns text to right*/}
							<Link to="/streams/new" className="ui button primary">
							{/*links to '/streams/new <CreateStream/>*/}
							Create Stream
							</Link>
						</div>
					);
				}
			}
		//now call this method in render():
			render(){
				return (
					<div>
						<h2>Streams</h2>
						<div className="ui celled list">{this.renderList()}</div>
						{this.renderCreate()}
						{/*calls helper method we just defined after the list*/}
					</div>
				); 
			};
			//We're now rendering a link to <CreateStream/> based upon whether or not user is signed in
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//When to Navigate to Users

	//So now when we Create a Stream we want to be automatically navigated back to the streams list index:

	//So far we've been navigating from component to component
		//Intentional Navigation: user clicks on a 'Link' component

	//Now we'll do this run code in response to some type of event, that will change the page user sees
		//Programmatic Navigation: We run code to forcibly navigate the user through our app

	//When, exactly do we want to navigate the user around?
		//We want to navigate the user away AFTER we can an API response, like this:

			//User Submits form
			//We make a req to backend api to create the stream
			//...Time passes...
			//API responds with success or error
			//We either show error to the user or navigate them back to list of streams

	//src/actions/index.js: navigate AFTER we dispatch our action:
		export const createStream = formValues => async (dispatch, getState) => {
			const { userId } = getState().auth;
		 	const response = await streams.post('/streams', { ...formValues, userId });
		 	dispatch({ type: CREATE_STREAM, payload: response.data });
		 	//Do some programmatic navigation to get the user back to the root list of streams
		};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//History References
	
	//This type of programmatic navigation with react router is NOT going to be easy

	//history object: keep track of the address back in your browser
		//this is hard b/c this is created by the browser router, b/c the code we have to write
		//to get a reference to this browser object is challenging

	//But why is it challenging to write code to reference the history browser router object?
		//component could 'easily trigger navigation inside of it'
			//but we're not doing navigation from a component, we're getting it from an ACTION CREATOR

	//One simple Solution:
		//get history object from BrowserRouter
			//Browser Router communicates history down to component
				//could say: anytime component calls action creator component should pass along the
				//history object into the action creator
					//inside action creator: we'd also accept a history object
						//this is a pain b/c everytime we'd want to navigate we'd have to write our
						//Ac to include all of this stuff
		//--> we'll use an alternative solution:

	//BrowserRouter creates 'history' object, b/c it internally maintains it internally it's hard to access

	//OUR SOLUTION: we will create the 'history' object, we'll create it inside of a dedicated file
		//we'll import this very easily b/c we didn't allow React-Router to create it
			//We'll create a history {} to whatever is the corresponding type to whatever router we created
				//history object will look at everything after the domain to decide waht content to show
				//b/c we're creating our own history we're using a generic Router
////////////////////////////////////////////////////////////////////////////////////////////////////

/*In the next lecture we are going to be creating our history object. As of React Router DOM v4.4.0 
you will get a warning in your console:

Warning: Please use `require("history").createBrowserHistory` 
instead of `require("history/createBrowserHistory")`. Support for the latter will be removed in the 
next major release.

To fix, our history.js file should instead look like this:

import { createBrowserHistory } from 'history'; 
export default createBrowserHistory();
*/


////////////////////////////////////////////////////////////////////////////////////////////////////
//Creating a Browser History Object

	//in src create history.js:
		import { createBrowserHistory } from 'history';//automatically loaded with React-Browser-Router lib
		export default createBrowserHistory();//creates browser history object
			//AND THAT'S IT!

	//Now let's create a plain router instead of a browser router:
	//App.js:
		import { Router, Route } from 'react-router-dom'; //import Router instead of BrowserRouter
		import history from '../history'; //import history object we just created
		const App = () => {
			return (
				<div className='ui container'>
					<Router history={history}>
							{/*adds history object as 'history' prop to top logic*/}
						<div>
							<Header />
							<Route path="/" exact component={StreamList} />
						</div>
					</Router>
				</div>
			);
		};
		//now with this we can trigger programmatic nav
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Implementing Programmatic Navigation

	//src/actions/index.js:
		import history from '../history';
		export const createStream = formValues => async (dispatch, getState) => {
			const { userId } = getState().auth;
		 	const response = await streams.post('/streams', { ...formValues, userId });
		 	dispatch({ type: CREATE_STREAM, payload: response.data });
		 	history.push('/');//navigates us to root: localhost:3000/
		};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Manually Changing API Records

	//Over time you may want to delete a bunch of data without having to manually delete, here's how
	//we do this:

	//in code editor go to api/db.json:
		//delete any records you don't want!
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//URL-Based Selection

	//We're going talk about how a user can get to the EditStream page, and what stream, they're
	//trying to edit:

	 //When we show index page: we'll show delete edit button next to user-created streams:
	 	//when they click 'edit':
	 		//--> will be navigated to edit page
	 			//we'll ahve to communicate which edit button user clicked to edit page:

	 //2 approaches to this:
	 	//1 - Selection Reducer - when a user clicks on a stream to edit it, use a 'selectionReducer'
	 		//to record what stream is being edited
	 	//2 - URL-Based Selection - Put the ID of the stream being edited in the URL
	 		//we'll have to change our route pathes just a little bit

	 //HERE'S WHAT OUR NEW PATHS WILL BE WITH URL-BASED SELECTION:

	 	//PATH 									COMPONENT
	 	// /			 		==>      			StreamList
	 	// /streams/new 		==>      			StreamCreate
	 	// /streams/edit/:id 	==>      			StreamEdit
	 	// /streams/delete/:id 	==>      			StreamDelete
	 	// /streams/:id			==>      			StreamShow
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Wildcard Navigation

	//To make use of url based navigation:
		//1 - when clicked on edit: navigate to: 'streams/edit/:id'	
		//2 - when navigate to 'streams/edit/:id' show <EditStream/>

	//src/components/streams/StreamList.js:
		renderAdmin(stream) {
			if (stream.userId === this.props.currentUserId) {
				return (
					<div className="right floated content">
						<Link to={`/streams/edit/${stream.id}`} className="ui button primary">Edit</Link>
						<button className="ui button negative">DELETE</button>
					</div>
				);
			}
		}

	//Now change the route in App.js:
		<Route path="/streams/edit/:id" exact component={StreamEdit} />
	//Now when we click the 'EDIT' button we navigate to StreamEdit component!
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//More on Route Params

	//Next we need to communicate the id # to the component
	//EditStream.js:
		import React from 'react';

		const StreamEdit = (props) => {
			console.log(props);
			return <div>StreamEdit</div>;
		};

		export default StreamEdit;

	//in app browser console:
		//props.match.params.id === '2'
			//will always be === to whatever is after ':' in Route.path
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Selecting Records from State
	
	//GOAL: print some info on the EditStream component so we know we have the right stream

	//need 2 kinds of info:
		//id of the stream (avail on props.match.parmas.id)
		//list of streams inside our redux state object

	//Get stream out of state store and render out some info, StreamEdit.js:
		import React from 'react';
		import { connect } from 'react-redux';
		import editStream from '../../actions';

		const StreamEdit = props => {
			console.log(props);//props not available in mapStateToProps below...
			return <div>StreamEdit</div>;
		}

		const mapStateToProps = (state, ownProps) => {//remember this automatically gets called w/ ownProps
			console.log(ownProps);//this is the same object as above ^^^^
			return { stream: ownProps.match.params.id };//therefore we access the id w/ the same thing
		}

		export default connect(mapStateToProps)(StreamEdit);
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Component Isolation with React Router
	
	//Here's our current issue: 	
		//@ "http://localhost:3000/streams/edit/3" console.log(props) ==> stream: undefined
		//however when we nagivate to root and select edit: console.log(props) ==> stream: streamdata
			//why is this?

	//React-Router Flow:
		//User types in streams/edit/3 to address bar and hits enter
		//User loads u our app
		//Redux state object is empty!
		//We try to select stream with id '3' from state
		//No streams were loaded, so we get 'undefined'!
		//We navigated to '/'
		//StreamList fetches all ouf our streams, updates Redux state
		//We nav back to '/streams/edit/3'
		//We select stream with id of 3
		//Data is now in redux store, so we see the appropriate stream

	//With React-Router, each component needs to be designed to work insolation: fetch it's own data!
		//needs to call Action Creator to reach to API to fetch data so it can show it on the screen

	//Solution - call this.props.fetchStreams() in StreamsEdit?
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Fetching a Stream for Edit Stream

	//GOAL: each component needs to be designed to work insolation: fetch it's own data!
	//In StreamEdit.js:
		import React from 'react';
		import { connect } from 'react-redux';

		import fetchStream from '../../actions';
		//import fetchStream action creator and pass off to connect

		//Change to class-based component
		class StreamEdit extends React.Component {
			componentDidMount(){
				this.props.fetchStream(this.props.match.params.id);
				//call fetchStream(id) in cdm:
			}
			render(){
				//conditional logic to render stream msg while stream loading
				if (!this.props.stream) {
					return <div>Loading...</div>;
				}

				return <div>{this.props.stream.title}</div>;
			}
		}

		const mapStateToProps = (state, ownProps) => {
			const id = ownProps.match.params.id;
			return { stream: state.streams[id] };
		};
		//pass fetchStream 2nd in 1st connect() call
		export default connect(mapStateToProps, { fetchStream })(StreamEdit);
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Real Code Reuse!

	//Look at WRs for Create and Edit forms... they're incredible similar:
		//A few differences:
			//Header is different
			//Title and Description fields aren't empty, has previous values in it and is editable
			//Need to call editStream AC

	//We're going to REUSE A COMPONENTS between these two forms:
		//We'll have three components:
			//StreamCreate: will refactor these to incorporate this new component
			//StreamEdit: will refactor these to incorporate this new component
			//StreamForm: bulk of redux-form, renders text input will be inside of here

	//Create src/components/streams/StreamForm.js:

	//copy StreamCreate.js and paste into StreamForm.js:
	//Component now looks like this:
		import React from 'react';
		import { Field, reduxForm } from 'redux-form';


		class StreamForm extends React.Component{
		//change classname to StreamForm
			renderError({ error, touched }) {
				if (touched && error) {
					return (
						<div className="ui error message">
							<div className="error">{error}</div>
						</div>
					);
				}
			};
			renderInput = ({ input, label, meta }) => {
				const className = `field ${meta.error && meta.touched ? 'error' : ''}`;
				return(
					<div className={className}>
						<label>{label}</label>
						<input {...input} autoComplete="off" />
						{this.renderError(meta)}
					</div>
				);
			};
			onSubmit = (formValues) => {
				this.props.onSubmit(formValues);
				//streamForm should attempt to call an onSubmit cb passed down props
			};
			render(){
				return(
					<div>
						<form className="ui form error" onSubmit={this.props.handleSubmit(this.onSubmit)} 
						>
							<Field name="title" component={this.renderInput} label="Enter Title" />
							<Field name="description" component={this.renderInput} label="Enter Description"/>
							<button className="ui button primary">Submit</button>
						</form>
					</div>
				)
			};
		};
		const validate = (formValues) => {
			const errors = {};
			if (!formValues.title) {
				errors.title = 'You must enter a title';
			}
			if (!formValues.description) {
				errors.description = 'You must enter a description';
			}
			return errors;
		};
		//remove 2nd default export statement, make 1st const export default
		export default reduxForm({
			form: 'streamForm', 
			//change '' associated w/ name of form to 'streamForm' (optional)
			validate
		})(StreamForm);//export this form state to StreamForm component
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Refactoring StreamCreate.js

	//We're going to refactor stream create to show an instance of StreamForm
	//StreamCreate.js now looks like this:

			//remove import for Field, reduxForm
			import React from 'react';
			import { connect } from 'react-redux';
			import { createStream } from '../../actions';
			import StreamForm from './StreamForm';
			//import component
			class StreamCreate extends React.Component {
			//remove rendererror(){} & renderinput(){}
				onSubmit = (formValues) => {
					// console.log("about to createStream with formValues: \n", formValues);
					this.props.createStream(formValues)
				};
				render(){
					//return <StreamForm/> and Header
					return(
						<div>
							<h3>Create a Stream:</h3>
							<StreamForm onSubmit={this.onSubmit}/>
							{/*pass in onSubmit funciton*/}
						</div>
					)
				};
			};
			//delete validation (done by form)
			//no form wrapping - delete (also done by form)
			export default connect(
				null,
				{ createStream }
			)(StreamCreate);//pass in this Component's name
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Setting Initial Values

	//When we pass props from StreamEdit down to StreamForm, we're technically passing props to reduxForm
		//reduxform has som especial props that we can pass down to our Redux Form Wrapped component

	//Stream Edit
		//onSubmit
		//initialValues for 'title' and 'description'
			//if we use 'initialValues' will set values for 1st values for this instance specifically
		//
		//
		//
		//ReduxForm{
			//StreamForm
		//}

	//in StreamEdit.js:
	import React from 'react';
	import { connect } from 'react-redux';

	import { fetchStream, editStream } from '../../actions';
	import StreamForm from './StreamForm';
	//import editStream, StreamForm

	class StreamEdit extends React.Component {
		componentDidMount(){
			this.props.fetchStream(this.props.match.params.id);
		}

		onSubmit = formValues => {
			//onSubmit: for now just call w/ form values and console.log()
			console.log("formValues in StreamEdit: ", formValues);
		}

		render(){
			if (!this.props.stream) {
				return <div>Loading...</div>;
			}

			return (
				<div>
					<h3>Edit Stream</h3>
					<StreamForm 
						//If we pass 'initialValues' from StreamEdit to StreamForm we'll pass in that record's values
						initialValues={{ 
							title: this.props.stream.title, 
							description: this.props.stream.description 
						}} 
						onSubmit={this.onSubmit}
					/>
				</div>
			); 
		}
	}

	const mapStateToProps = (state, ownProps) => {
		const id = ownProps.match.params.id;
		return { stream: state.streams[id] };
	};

	export default connect(
		mapStateToProps,
	 	{ fetchStream, editStream }
		//pass editStream into connect w/existing AC
	)(StreamEdit);
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Avoiding Changes to Properties

	//Let's use lodash to set the initial values from props to current form render:
	render(){
		return (
			<div>
				<h3>Edit Stream</h3>
				<StreamForm 
					initialValues={_.pick(this.props.stream, 'title', 'description') } 
					//_.pick(object, 'prop1', 'prop2') --> sets title and desc w/ initial values from 
					//this.props.stream
					onSubmit={this.onSubmit}
				/>
			</div>
		);
	}

	//Example of the lodash _.pick() function:
	const profile = {
	  name: 'Sam',
	  age: 18,
	  favoriteColor: 'green'
	};

	_.pick(profile, 'name');
	//returns new object: {"name":"Sam"}
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Edit Form Submission
	
	//EditStream: we need to wire up the streamEdit AC to the onSubmit() method:

	//Let's familiaze ourselves w/ the editStream AC:
		export const editStream = (id, formValues) => async dispatch => {
			//takes in args of form's ID, and new formValues
		const response = await streams.put(`/streams/${id}`, formValues);
		dispatch({ type: EDIT_STREAM, payload: response.data });
	};

	//EditStream.js
		onSubmit = formValues => {
			this.props.editStream(this.props.match.params.id, formValues);
			//calling editStream(streamId, newFormValues)
		}

	//Actions/index.js: 
		export const editStream = (id, formValues) => async dispatch => {
			const response = await streams.put(`/streams/${id}`, formValues);
			dispatch({ type: EDIT_STREAM, payload: response.data });
			//need programmatic navigation to get the user back to the root list of streams
			history.push('/');
		};

	//Ok so this works as expected... except... 
		//when we return to StreamList we acn't see an edit/delete button on the stream we just edited
////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
//PUT vs PATCH Requests

	//If we look in the posts request in network tab in app browser console:
		//you'll see that there isn't a userId associated w/ the edited record/stream

	//This is due RESTful conventions:
		//Update ALL properties of a record 	PUT 	/streams/:id 	single record
			//whatever properties you put in the body of that request will replace all the 
			//properties that were originally included 
				//took title, description, id, userId and replaced them w/ title + description
					//one property that is immune to this is: id
		//Update SOME properties of a record 	PATCH 	/streams/:id 	single record
			//you're actually supposed to use this if you just want to update SOME properties

	//Update action creator to include a patch request instead, in src/actions/index.js:
		export const editStream = (id, formValues) => async dispatch => {
			const response = await streams.patch(`/streams/${id}`, formValues);
		};
			//now when we edit we see the edit/delete buttons!
////////////////////////////////////////////////////////////////////////////////////////////////////




