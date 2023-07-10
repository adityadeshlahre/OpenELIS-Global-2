import React, { useCallback } from "react";
import { useContext, useState, useEffect, useRef } from "react";
import { Form, Stack, TextInput, Select, SelectItem, Button, IconButton, Toggle, Loading, RadioButtonGroup, RadioButton, ModalWrapper } from '@carbon/react';
import AutoComplete from '../../common/AutoComplete.js'
import { Add, Subtract, Save } from '@carbon/react/icons';
import { FormattedMessage } from "react-intl";
import { CalculatedValueFormValues, CalculatedValueFormModel, OperationType, OperationModel } from '../../formModel/innitialValues/CalculatedValueFormSchema'
import { getFromOpenElisServer, postToOpenElisServer, getFromOpeElisServerSync } from '../../utils/Utils.js';
import { NotificationContext } from "../../layout/Layout";
import { AlertDialog, NotificationKinds } from "../../common/CustomNotification";
interface CalculatedValueProps {
}

type TestListField = 'TEST_RESULT' | 'FINAL_RESULT'
interface SampleTestListInterface {
  TEST_RESULT: { [key: number]: { [key: number]: Array<TestResponse> } }
  FINAL_RESULT: { [key: number]: Array<TestResponse> }
}

interface TestResponse {
  id: number,
  value: string,
  type: string
}

var TestListObj: SampleTestListInterface = {
  "TEST_RESULT": {}, "FINAL_RESULT": {}
}


const CalculatedValue: React.FC<CalculatedValueProps> = () => {
  const componentMounted = useRef(true);
  const [calculationList, setCalculationList] = useState([CalculatedValueFormValues]);
  const [showConfirmBox, setShowConfirmBox] = useState(true);
  const [sampleList, setSampleList] = useState([]);
  const [sampleTestList, setSampleTestList] = useState(TestListObj);
  const [loaded, setLoaded] = useState(false);
  const { notificationVisible, setNotificationVisible, setNotificationBody } = useContext(NotificationContext);

  useEffect(() => {
    getFromOpenElisServer("/rest/samples", fetchSamples);
    getFromOpenElisServer("/rest/test-calculations", loadCalculationList)

    return () => { // This code runs when component is unmounted
      componentMounted.current = false;
    }

  }, []);

  const loadCalculationList = (calculations) => {
    if (componentMounted.current) {
      // console.log(JSON.stringify(reflexRuleList))
      if (calculations.length > 0) {
        setCalculationList(calculations);

        calculations.forEach((calculation, index) => {
          if (calculation.sampleId) {
            getFromOpenElisServer("/rest/test-beans-by-sample?sampleType=" + calculation.sampleId, (resp) => fetchTests(resp, "FINAL_RESULT", index, 0));
          }

          calculation.operations.forEach((operation, opeartionIdex) => {
            if (operation.sampleId) {
              getFromOpenElisServer("/rest/test-beans-by-sample?sampleType=" + operation.sampleId, (resp) => fetchTests(resp, "TEST_RESULT", index, opeartionIdex));
            }
          })
        });
      }
    }
  }

  const fetchSamples = (sampleList) => {
    if (componentMounted.current) {
      setSampleList(sampleList);
    }
  }

  const CalculatedValueObj: CalculatedValueFormModel = {
    id: null,
    name: "",
    sampleId: null,
    testId: null,
    toggled: true,
    active: true,
    operations: [
      {
        id: null,
        order: null,
        type: 'TEST_RESULT',
        value: "",
        sampleId: null
      }
    ]
  };

  const handleRuleAdd = () => {
    setCalculationList([...calculationList, CalculatedValueObj]);
  };

  const handleRuleRemove = (index, id) => {
    const list = [...calculationList];
    list.splice(index, 1);
    setCalculationList(list);
    if (id) {
      postToOpenElisServer("/rest/deactivate-test-calculation/" + id, {}, handleDelete);
    }
    setShowConfirmBox(false)
  };

  const handleDelete = (status) => {
    setNotificationVisible(true);
    if (status == "200") {
      setNotificationBody({ kind: NotificationKinds.success, title: "Notification Message", message: "Succesfuly Deleted" });
    } else {
      setNotificationBody({ kind: NotificationKinds.error, title: "Notification Message", message: "Error while Deleting" });
    }
  }

  const handleCancelDelete = () => {
    setShowConfirmBox(false)
  };

  const addOperation = (index: number, type: OperationType) => {
    const list = [...calculationList];
    var operation: OperationModel = {
      id: null,
      order: null,
      type: type,
      value: '',
      sampleId: null,
    }

    list[index]['operations'].push(operation);
    console.log(JSON.stringify(list[index]['operations']))
    setCalculationList(list);
  };

  const insertOperation = (index: number, operationIndex: number, type: OperationType) => {

    var operation: OperationModel = {
      id: null,
      order: null,
      type: type,
      value: '',
      sampleId: null,
    }
    const list = [...calculationList];
    //list[index]['operations'].push(operation);
    list[index]['operations'].splice(operationIndex + 1, 0, operation);
    console.log(JSON.stringify(list[index]['operations']))
    setCalculationList(list);
  };

  const removeOperation = (index: number, operationIndex: number) => {
    const list = [...calculationList];
    list[index]['operations'].splice(operationIndex, 1);
    setCalculationList(list);
  }

  const handleSampleSelected = (e: any, field: TestListField, index: number, item_index: number) => {
    const { value } = e.target;
    getFromOpenElisServer("/rest/test-beans-by-sample?sampleType=" + value, (resp) => fetchTests(resp, field, index, item_index));
  }

  const loadSampleTestList = (field: TestListField, index: number, item_index: number, resultList: any) => {
    const results = { ...sampleTestList }
    if (!results[field][index]) {
      results[field][index] = {}
    }
    switch (field) {
      case "TEST_RESULT":
        results[field][index][item_index] = resultList.filter(result => result.dataType === 'N');
        break
      case "FINAL_RESULT":
        results[field][index] = resultList
        break
    }
    setSampleTestList(results);
  }

  const fetchTests = (testList: any, field: TestListField, index: number, item_index: number) => {
    loadSampleTestList(field, index, item_index, testList);
    setLoaded(true)
  }

  function handleTestSelection(id: number, index: number) {
    const list = [...calculationList];
    list[index]["testId"] = id;
    setCalculationList(list);
  }

  function handleOperationTestSelection(id: number, index: number, operationIndex: number) {
    const list = [...calculationList];
    list[index]["operations"][operationIndex]["value"] = id;
    setCalculationList(list);
  }

  function setOperationOrder(index: number, operationIndex: number) {
    const list = [...calculationList];
    list[index]["operations"][operationIndex]["order"] = operationIndex;
    setCalculationList(list);
  }

  const handleCalculationFieldChange = (e: any, index: number) => {
    const { name, value } = e.target;
    const list = [...calculationList];
    list[index][name] = value;
    setCalculationList(list);
  };

  const handleOperationFieldChange = (e: any, index: number, operationIndex: number) => {
    const { name, value } = e.target;
    const list = [...calculationList];
    list[index]["operations"][operationIndex][name] = value;
    setCalculationList(list);
  };

  const handleCalculationSubmited = (status, index) => {
    setNotificationVisible(true);
    if (status == "200") {
      const element = document.getElementById("submit_" + index)
      element.disabled = true;
      setNotificationBody({ kind: NotificationKinds.success, title: "Notification Message", message: "Succesfuly saved" });
    } else {
      setNotificationBody({ kind: NotificationKinds.error, title: "Notification Message", message: "Error while saving" });
    }
  };

  const handleSubmit = (event: any, index: number) => {
    event.preventDefault(mathematicalOpeartion);
    var mathematicalOpeartion ="";
    calculationList[index]['operations'].forEach(
      (operation, opearationIndex) => { 
        operation.order = opearationIndex;
        mathematicalOpeartion = mathematicalOpeartion + operation.value + " ";
      }
    )
    try {
      // Code that might throw an error
      eval(mathematicalOpeartion)
      console.log(JSON.stringify(calculationList[index]))
      postToOpenElisServer("/rest/test-calculation", JSON.stringify(calculationList[index]), (status) => handleCalculationSubmited(status, index))
      
    } catch (error) {
      setNotificationVisible(true);
      setNotificationBody({ kind: NotificationKinds.error, title: "Notification Message", message: "Invalid Calculation Logic : " + error.message });
    }
  };
  function getOperationInputByType(index: number, operationIndex: number, type: OperationType, operation: OperationModel) {
    switch (type) {
      case "TEST_RESULT":
        return (<>
          <div className="first-row">
            <Select
              id={index + "_" + operationIndex + "_sample"}
              name="sampleId"
              labelText={<FormattedMessage id="rulebuilder.label.selectSample" />}
              value={operation.sampleId}
              className="inputSelect"
              onChange={(e) => { handleSampleSelected(e, "TEST_RESULT", index, operationIndex); handleOperationFieldChange(e, index, operationIndex) }}
              required
            >
              <SelectItem
                text=""
                value=""
              />
              {sampleList.map((sample, sample_index) => (
                <SelectItem
                  text={sample.value}
                  value={sample.id}
                  key={sample_index}
                />
              ))}
            </Select>
          </div>
          <div className="first-row">
            <AutoComplete
              id={index + "_" + operationIndex + "_testresult"}
              label="Test Result"
              class="inputText"
              name="operationtestName"
              value={operation.value}
              onSelect={(id) => handleOperationTestSelection(id, index, operationIndex)}
              suggestions={sampleTestList["TEST_RESULT"][index] ? sampleTestList["TEST_RESULT"][index][operationIndex] : []}>
            </AutoComplete>
          </div>
        </>);
      case "MATH_FUNCTION":
        return (<div className="first-row">
          <Select
            id={index + "_" + operationIndex + "_mathfunction"}
            name="value"
            labelText={<FormattedMessage id="Mathematical Function" />}
            value={operation.value}
            className="inputSelect2"
            onChange={(e) => { handleOperationFieldChange(e, index, operationIndex) }}
            required
          >
            <SelectItem
              text=""
              value=""
            />
            <SelectItem
              text="("
              value="("
            />
            <SelectItem
              text=")"
              value=")"
            />
            <SelectItem
              text="+"
              value="+"
            />
          </Select>
        </div>);
      case "INTEGER":
        return (<div className="first-row">
          <TextInput
            name="value"
            className="inputText2"
            type="number"
            id={index + "_" + operationIndex + "_integer"}
            labelText={<FormattedMessage id="Integer" />}
            value={operation.value}
            onChange={(e) => { handleOperationFieldChange(e, index, operationIndex) }}
          />
        </div>);
      case "PATIENT_ATTRIBUTE":
        return (<div className="first-row">
          <Select
            id={index + "_" + operationIndex + "_patientattribute"}
            name="value"
            labelText={<FormattedMessage id="Patient attribute" />}
            value={operation.value}
            className="inputSelect2"
            onChange={(e) => { handleOperationFieldChange(e, index, operationIndex) }}
            required
          >
            <SelectItem
              text=""
              value=""
            />
            <SelectItem
              text="Age"
              value="age"
            />
            <SelectItem
              text="Sex"
              value="sex"
            />
          </Select>
        </div>);
    }
  }

  const addOperationBySelect = (e: any, index: number, opearationIndex: number) => {
    const { value } = e.target;
    insertOperation(index, opearationIndex, value);
  }

  const toggleCalculation = (e, index) => {
    const list = [...calculationList];
    list[index]["toggled"] = e;
    setCalculationList(list);
  }

  return (
    <div className='adminPageContent'>
      {notificationVisible === true ? <AlertDialog /> : ""}
      {calculationList.map((calculation, index) => (
        <div key={index} className="rules" >
          <div className="first-division">
            <Form onSubmit={(e) => handleSubmit(e, index)}>
              <Stack gap={7}>
                <div className="ruleBody">
                  <div className="inlineDiv">
                    <div>
                      <TextInput
                        name="name"
                        className="reflexInputText"
                        type="text"
                        id={index + "_name"}
                        labelText={<FormattedMessage id="Calculation Name" />}
                        value={calculation.name}
                        onChange={(e) => handleCalculationFieldChange(e, index)}
                      />
                    </div>
                    <div >
                      &nbsp;  &nbsp;
                    </div>
                    <div >
                      <Toggle
                        toggled={calculation.toggled}
                        aria-label="toggle button"
                        id={index + "_toggle"}
                        labelText={<FormattedMessage id="rulebuilder.label.toggleRule" />}
                        onToggle={(e) => toggleCalculation(e, index)}
                      />
                    </div>
                  </div>
                  {calculation.toggled && (
                    <>
                      <div className="inlineDiv">
                        Add   &nbsp;  &nbsp;
                        <div>
                          <Button renderIcon={Add} id={index + "_testresult"} kind='tertiary' size='sm' onClick={() => addOperation(index, 'TEST_RESULT')}>
                            <FormattedMessage id="Test Result" />
                          </Button>
                        </div>
                        <div >
                          &nbsp;  &nbsp;
                        </div>
                        <div>
                          <Button renderIcon={Add} id={index + "_mathfunction"} kind='tertiary' size='sm' onClick={() => addOperation(index, 'MATH_FUNCTION')}>
                            <FormattedMessage id="Mathematical Function" />
                          </Button>
                        </div>
                        <div >
                          &nbsp;  &nbsp;
                        </div>
                        <div>
                          <Button renderIcon={Add} id={index + "_integer"} kind='tertiary' size='sm' onClick={() => addOperation(index, 'INTEGER')}>
                            <FormattedMessage id="Integer" />
                          </Button>
                        </div>
                        <div >
                          &nbsp;  &nbsp;
                        </div>
                        <div>
                          <Button renderIcon={Add} id={index + "_patientattribute"} kind='tertiary' size='sm' onClick={() => addOperation(index, 'PATIENT_ATTRIBUTE')}>
                            <FormattedMessage id="Patient Attribute" />
                          </Button>
                        </div>
                      </div>
                      <div className="section">
                        <div className="inlineDiv">
                          <h5><FormattedMessage id="Calculation" /></h5>
                        </div>
                        <div className="section">
                          <div className="inlineDiv">
                            {calculation.operations.map((operation, opearationIndex) => (
                              <div>
                                {operation.type === 'PATIENT_ATTRIBUTE' ? "patientAttr=" : ""}{operation.type === 'TEST_RESULT' ? "testId=" : ""}{operation.value}  &nbsp;
                              </div>
                            ))}
                          </div>
                        </div>
                        {calculation.operations.map((operation, operation_index) => (
                          <div key={index + "_" + operation_index} className="inlineDiv">
                            {getOperationInputByType(index, operation_index, operation.type, operation)}
                            <div >
                              &nbsp;  &nbsp;
                            </div>
                            <div className="second-row">
                              {operation.type !== '' && (
                                <IconButton renderIcon={Subtract} id={index + "_removeoperation"} kind='danger' label='' size='sm' onClick={() => removeOperation(index, operation_index)} />
                              )}
                            </div>
                            <div >
                              &nbsp;  &nbsp;
                            </div>
                            <div >
                              {/* {calculation.operations.length - 1 === operation_index && ( */}
                              <Select
                                id={index + "_" + operation_index + "_addopeartion"}
                                name="addoperation"
                                labelText={<FormattedMessage id="Insert Operation Below" />}
                                value={calculation.sampleId}
                                className="inputSelect"
                                onChange={(e) => { addOperationBySelect(e, index, operation_index) }}
                              >
                                <SelectItem
                                  text=""
                                  value=""
                                />
                                <SelectItem
                                  text="Test Result"
                                  value="TEST_RESULT"
                                />
                                <SelectItem
                                  text="Mathematical Function"
                                  value="MATH_FUNCTION"
                                />
                                <SelectItem
                                  text="Integer"
                                  value="INTEGER"
                                />
                                <SelectItem
                                  text="Patient Attribute"
                                  value="PATIENT_ATTRIBUTE"
                                />
                              </Select>
                              {/* )} */}
                            </div>
                          </div>
                        ))}

                        <div className="inlineDiv">
                          <div >
                            <Select
                              id={index + "_sample"}
                              name="sampleId"
                              labelText={<FormattedMessage id="rulebuilder.label.selectSample" />}
                              value={calculation.sampleId}
                              className="inputSelect"
                              onChange={(e) => { handleSampleSelected(e, "FINAL_RESULT", index, 0); handleCalculationFieldChange(e, index) }}
                              required
                            >
                              <SelectItem
                                text=""
                                value=""
                              />
                              {sampleList.map((sample, sample_index) => (
                                <SelectItem
                                  text={sample.value}
                                  value={sample.id}
                                  key={sample_index}
                                />
                              ))}
                            </Select>
                          </div>
                          <div>
                            <AutoComplete
                              id={index + "_finalresult"}
                              class="inputText"
                              label="Final Result"
                              name="testName"
                              onSelect={(id) => handleTestSelection(id, index)}
                              value={calculation.testId}
                              suggestions={sampleTestList["FINAL_RESULT"][index] ? sampleTestList["FINAL_RESULT"][index] : []}>
                            </AutoComplete>
                          </div>
                        </div>

                      </div>
                      <Button renderIcon={Save} id={"submit_" + index} type="submit" kind='primary' size='sm'>
                        <FormattedMessage id="label.button.submit" />
                      </Button>
                    </>
                  )}
                </div>
              </Stack>
            </Form >
            {calculationList.length - 1 === index && (
              <IconButton onClick={handleRuleAdd} label={<FormattedMessage id="rulebuilder.label.addRule" />} size='md' kind='tertiary' >
                <Add size={16} />
                <span><FormattedMessage id="rulebuilder.label.rule" /></span>
              </IconButton>
            )}
          </div>
          <div className="second-division">
            {calculationList.length !== 1 && (
              <ModalWrapper
                modalLabel={<FormattedMessage id="label.button.confirmDelete" />}
                open={showConfirmBox}
                onRequestClose={() => setShowConfirmBox(false)}
                handleSubmit={() => handleRuleRemove(index, calculation.id)}
                onSecondarySubmit={handleCancelDelete}
                primaryButtonText={<FormattedMessage id="label.button.confirm" />}
                secondaryButtonText={<FormattedMessage id="label.button.cancel" />}
                modalHeading={<FormattedMessage id="rulebuilder.label.confirmDelete" />}
                buttonTriggerText={<FormattedMessage id="rulebuilder.label.removeRule" />}
                size='md'
              >
              </ModalWrapper>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}

export default CalculatedValue;