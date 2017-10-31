import React from 'react';
import axios from 'axios';
import { Col, Form, FormControl, Button, ButtonToolbar, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import FocusGroupsList from './FocusGroupsList.jsx';
import FocusGroupsPatreonModule from './FocusGroupsPatreonModule.jsx';

// React-Redux connect() boilerplate
// NOTE: you may have to modify the filepath for ChangeActions
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ChangeActions from '../../../actions';

class FocusGroupsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      typedFocusGroupName: '',
      typedTesterUsername: '',
      applyUsers: [],
      addTo: 'none'
    };
    this.updateTypedTesterUsername = this.updateTypedTesterUsername.bind(this);
    this.updateTypedFocusGroupName = this.updateTypedFocusGroupName.bind(this);
    this.createNewFocusGroup = this.createNewFocusGroup.bind(this);
    this.deleteFocusGroup = this.deleteFocusGroup.bind(this);
    this.addTesterToFocusGroup = this.addTesterToFocusGroup.bind(this);
    this.removeTesterFromFocusGroup = this.removeTesterFromFocusGroup.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.applyFocusGroup = this.applyFocusGroup.bind(this);
    console.log(this);
  }

  componentDidMount() {
    axios.get('/api/group/getApply')
      .then(applyUsers => {
        console.log(applyUsers);
        this.setState({
          applyUsers: applyUsers.data
        }, () => {
          console.log(this);
        })
      })
  }

  updateTypedTesterUsername(e) {
    this.setState({typedTesterUsername: e.target.value});
  }

  updateTypedFocusGroupName(e) {
    this.setState({typedFocusGroupName: e.target.value});
  }

  createNewFocusGroup(e) {
    e.preventDefault();
    axios.post('/api/creator/newFocusGroup', {
      focusGroupName: this.state.typedFocusGroupName,
      creatorUsername: this.props.loggedInUser.username
    })
      .then(res => {
        this.props.actions.addFocusGroup(res.data.name);
        this.setState({typedFocusGroupName: ''});
      });
  }

  deleteFocusGroup() {
    axios.put('/api/creator/deleteFocusGroup', {
      focusGroup: this.props.currentFocusGroup,
      creatorUsername: this.props.loggedInUser.username
    })
      .then(res => {
        if (res.data) this.props.actions.deleteFocusGroup(this.props.currentFocusGroup.name);
        else console.log('Error deleting Group');
      })
      .catch(err => {
        console.log('Error deleting Group:', err);
      });
  }

  addTesterToFocusGroup(e) {
    e.preventDefault();
    let focusGroupName = this.props.currentFocusGroup.name;
    let testerUsername = this.state.typedTesterUsername;
    axios.post('/api/creator/addToFocusGroup', {
      focusGroupName,
      testerUsername
    })
      .then(res => {
        if (res.data) this.props.actions.addTesterToFocusGroup(focusGroupName, testerUsername);
        else console.log('Error associating Tester with Group:', res);
        this.setState({typedTesterUsername: ''});
      })
      .catch(err => {
        console.log('Error adding Tester to Group:', err);
      });
  }

  removeTesterFromFocusGroup(tester) {
    let focusGroupName = this.props.currentFocusGroup.name;
    let testerUsername = tester;
    axios.put('/api/creator/removeFromFocusGroup', {
      focusGroupName,
      testerUsername
    })
      .then(res => {
        if (res.data) this.props.actions.removeTesterFromFocusGroup(focusGroupName, testerUsername);
        else console.log('Error removing Tester from Group');
      })
      .catch(err => {
        console.log('Error removing Tester from Group:', err);
      });
  }

  handleChange(e) {
    let val = e.target.value;
    this.setState({addTo: val}, () => {
      console.log(this);
    });
  }

  applyFocusGroup(username) {
    let data = {
      username: username,
      focusGroup: this.state.addTo
    }
    axios.post('/api/group/applyTester', data)
      .then(res => {
        console.log(res);
      })
  }

  render() {
    let focusGroups = this.props.focusGroups;
    let currentFocusGroup = this.props.currentFocusGroup;
    let appliedUsers = this.state.applyUsers.map((user, i) => {
      return (
        <div>
          <Col md={3}>
            <p> {user.username} </p>
          </Col>
          <Col md={3}>
            <select onChange={this.handleChange}>
                  <option name="addTo" value="none" > None </option>
              {this.props.focusGroups.map((group, i) => {
                return (
                  <option name="addTo" value={group.name}>{group.name} </option>
                  )
              })}
            </select>
          </Col>
          <Col md={3}>
            <button onClick={() => {
              this.applyFocusGroup(user)
            }}> Add </button>
          </Col>
        </div>
        )
    })

    return (
      <div>
        {this.props.patreonCampaign.id ? <FocusGroupsPatreonModule /> : null}
        <h2>New Group</h2>
        <form onSubmit={this.createNewFocusGroup}>
          <FormControl
            type='text'
            value={this.state.typedFocusGroupName}
            placeholder='Group Name'
            onChange={this.updateTypedFocusGroupName}
          />
          <Button bsStyle='primary' type='submit'>Create Group</Button>
        </form>
        <div>
          <h2> Applied People </h2>
          {appliedUsers}
        </div>
        <br/>

        {focusGroups.length > 0 ?
          <FocusGroupsList />
          :
          null}

        {currentFocusGroup ?
          <div>

            <Button
              bsSize='xsmall'
              bsStyle='danger'
              onClick={this.deleteFocusGroup}
            > Delete Group </Button>

            <h2>Add Tester to {currentFocusGroup.name}</h2>

            <form onSubmit={this.addTesterToFocusGroup}>
              <FormControl
                type='text'
                value={this.state.typedTesterUsername}
                placeholder='Tester Username'
                onChange={this.updateTypedTesterUsername}
              />
              <Button bsStyle='primary' type='submit'>Add Tester</Button>
            </form>

            <h2>{currentFocusGroup.name} Members</h2>

            {currentFocusGroup.testers.length > 0 ?
              <ul className='focusGroupTesterList'>
                {currentFocusGroup.testers.map((tester, i) => (
                  <li
                    className='focusGroupTesterListEntry'
                    key={i}
                    onClick={this.removeTesterFromFocusGroup.bind(null, tester)}
                  > {tester} </li>
                ))}
              </ul>
              :
              'none'}

          </div>
          :
          null}

      </div>
    );
  }
}

// React-Redux connect() boilerplate
// 1. Include the properties in the Store you want this component to have access to
// 2. Change the Component name at the very end to the one in the current file
const mapStateToProps = (state) => ({
  loggedInUser: state.loggedInUser,
  focusGroups: state.focusGroups,
  currentFocusGroup: state.currentFocusGroup,
  patreonCampaign: state.patreonCampaign,
  router: state.router
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ChangeActions, dispatch)
});

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(FocusGroupsPage));