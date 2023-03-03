
  // status
  const [status, setStatus] = useState(false);

  // associate states with thisTask state
  useEffect(() => {
    setTaskName(thisTask?.taskName);
    setPriority(thisTask?.priority);
    setResourceItems(thisTask?.resources);
    setAssigned(thisTask?.isAssigned || false);
    setStatus(thisTask?.status || false);
    setHoursBest(thisTask?.hoursBest);
    setHoursWorst(thisTask?.hoursWorst);
    setHoursMost(thisTask?.hoursMost);
    setHoursEstimate(thisTask?.estimatedHours);
    setLinks(thisTask?.links);
    setCategory(thisTask?.category);
    setWhyInfo(thisTask?.whyInfo);
    setIntentInfo(thisTask?.intentInfo);
    setEndstateInfo(thisTask?.endstateInfo);
    setStartedDate(thisTask?.startedDatetime);
    setDueDate(thisTask?.dueDatetime);
  }, [thisTask]);


    const handleStatus = (value) => {
      setStatus(value);
    };

    <tr>
    <td scope="col">Status</td>
    <td scope="col">
      <div className="flex-row  d-inline align-items-center">
        <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          id="started"
          name="started"
          value="true"
          onChange={(e) => handleStatus(true)}
          checked={status}
        />
          <label className="form-check-label" htmlFor="started">
            Started
          </label>
        </div>
        <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          id="notStarted"
          name="started"
          value="false"
          onChange={(e) => handleStatus(false)}
          checked={!status}
        />
          <label className="form-check-label" htmlFor="notStarted">
            Not Started
          </label>
        </div>
      </div>
    </td>
  </tr>