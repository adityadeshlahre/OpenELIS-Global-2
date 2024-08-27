import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Heading,
  Button,
  Loading,
  Grid,
  Column,
  Section,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableHeader,
  TableCell,
  TableSelectRow,
  TableSelectAll,
  TableContainer,
  Pagination,
  Search,
  Modal,
  TextInput,
  Dropdown,
  Checkbox,
} from "@carbon/react";
import {
  getFromOpenElisServer,
  postToOpenElisServerFullResponse,
  postToOpenElisServerJsonResponse,
} from "../../utils/Utils.js";
import {
  ConfigurationContext,
  NotificationContext,
} from "../../layout/Layout.js";
import {
  AlertDialog,
  NotificationKinds,
} from "../../common/CustomNotification.js";
import { FormattedMessage, injectIntl, useIntl } from "react-intl";
import PageBreadCrumb from "../../common/PageBreadCrumb.js";
import { Settings } from "@carbon/icons-react";
import ActionPaginationButtonType from "../../common/ActionPaginationButtonType.js";

let breadcrumbs = [
  { label: "home.label", link: "/" },
  { label: "breadcrums.admin.managment", link: "/MasterListsPage" },
  {
    label: "testnotificationconfig.browse.title",
    link: "/MasterListsPage#testNotificationConfigMenu",
  },
];

function TestNotificationConfigMenu() {
  const { notificationVisible, setNotificationVisible, addNotification } =
    useContext(NotificationContext);

  const intl = useIntl();

  const componentMounted = useRef(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saveButton, setSaveButton] = useState(true);
  const [testNamesList, setTestNamesList] = useState([]);
  const [testNotificationConfigMenuData, setTestNotificationConfigMenuData] =
    useState({});
  const [
    testNotificationConfigMenuDataPost,
    setTestNotificationConfigMenuDataPost,
  ] = useState({ menuList: [], selectedIDs: [] });
  const [testNamesMap, setTestNamesMap] = useState({});

  const handleMenuItems = (res) => {
    if (!res) {
      setLoading(true);
    } else {
      setTestNotificationConfigMenuData(res);
    }
  };

  const handleTestNamesList = (res) => {
    if (!res) {
      setLoading(true);
    } else {
      setTestNamesList(res);
    }
  };

  useEffect(() => {
    componentMounted.current = true;
    setLoading(true);
    getFromOpenElisServer(`/rest/TestNotificationConfigMenu`, handleMenuItems);
    getFromOpenElisServer(`/rest/test-list`, handleTestNamesList);
    return () => {
      componentMounted.current = false;
      setLoading(false);
    };
  }, []);

  useEffect(() => {
    if (
      testNotificationConfigMenuData &&
      testNotificationConfigMenuData.menuList
    ) {
      setTestNotificationConfigMenuDataPost((prevTestNotificationDataPost) => ({
        ...prevTestNotificationDataPost,
        formMethod: testNotificationConfigMenuData.formMethod,
        // formAction: testNotificationConfigMenuData.formAction,
        // formName: testNotificationConfigMenuData.formName,
        // config: testNotificationConfigMenuData.config,
        cancelAction: testNotificationConfigMenuData.cancelAction,
        submitOnCancel: testNotificationConfigMenuData.submitOnCancel,
        cancelMethod: testNotificationConfigMenuData.cancelMethod,
        // adminMenuItems: testNotificationConfigMenuData.adminMenuItems,
        totalRecordCount: testNotificationConfigMenuData.totalRecordCount,
        fromRecordCount: testNotificationConfigMenuData.fromRecordCount,
        toRecordCount: testNotificationConfigMenuData.toRecordCount,
        selectedIDs: testNotificationConfigMenuData.selectedIDs || [],
        menuList: testNotificationConfigMenuData.menuList || [],
      }));
    }
  }, [testNotificationConfigMenuData]);

  useEffect(() => {
    const map = testNamesList.reduce((acc, item) => {
      acc[item.id] = item.value;
      return acc;
    }, {});
    setTestNamesMap(map);
  }, [testNamesList]);

  const handleEditButtonClick = (id) => {
    window.location.assign(
      `/MasterListsPage#testNotificationConfig?testId=${id}`,
    );
  };

  function testNotificationConfigMenuSavePostCall() {
    setLoading(true);
    postToOpenElisServerJsonResponse(
      `/rest/TestNotificationConfigMenu`,
      JSON.stringify(testNotificationConfigMenuDataPost),
      (res) => {
        testNotificationConfigMenuSavePostCallBack(res);
      },
    );
  }

  function testNotificationConfigMenuSavePostCallBack(res) {
    if (res) {
      setLoading(false);
      addNotification({
        title: intl.formatMessage({
          id: "notification.title",
        }),
        message: intl.formatMessage({
          id: "notification.user.post.save.success",
        }),
        kind: NotificationKinds.success,
      });
      setNotificationVisible(true);
      // setTimeout(() => {
      //   window.location.reload();
      // }, 200);
    } else {
      addNotification({
        kind: NotificationKinds.error,
        title: intl.formatMessage({ id: "notification.title" }),
        message: intl.formatMessage({ id: "server.error.msg" }),
      });
      setNotificationVisible(true);
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }
  }

  const handleCheckboxChange = (e, rowId, header) => {
    const isChecked = e.target.checked;

    setTestNotificationConfigMenuDataPost((prevData) => {
      const updatedMenuList = prevData.menuList.map((item) => {
        if (item.testId === rowId) {
          switch (header) {
            case "patientEmail":
              return {
                ...item,
                patientEmail: { ...item.patientEmail, active: isChecked },
              };
            case "patientSMS":
              return {
                ...item,
                patientSMS: { ...item.patientSMS, active: isChecked },
              };
            case "providerEmail":
              return {
                ...item,
                providerEmail: { ...item.providerEmail, active: isChecked },
              };
            case "providerSMS":
              return {
                ...item,
                providerSMS: { ...item.providerSMS, active: isChecked },
              };
            default:
              return item;
          }
        }
        return item;
      });

      // const updatedSelectedIDs = isChecked
      //   ? [...new Set([...prevData?.selectedIDs, rowId])]
      //   : prevData?.selectedIDs.filter((id) => id !== rowId); // testID

      // const updatedSelectedIDs = isChecked
      //   ? [
      //       ...new Set([
      //         ...prevData.selectedIDs,
      //         ...prevData.menuList
      //           .filter((item) => item.testId === rowId)
      //           .map((item) => item.id),
      //       ]),
      //     ]
      //   : prevData.selectedIDs.filter(
      //       (id) =>
      //         !prevData.menuList.find(
      //           (item) => item.testId === rowId && item.id === id,
      //         ),
      //     ); // id

      const idsToUpdate = updatedMenuList
        .filter((item) => item.testId === rowId)
        .flatMap((item) => {
          const ids = [];
          if (header === "patientEmail" && item.patientEmail.active) {
            ids.push(item.patientEmail.id);
          }
          if (header === "patientSMS" && item.patientSMS.active) {
            ids.push(item.patientSMS.id);
          }
          if (header === "providerEmail" && item.providerEmail.active) {
            ids.push(item.providerEmail.id);
          }
          if (header === "providerSMS" && item.providerSMS.active) {
            ids.push(item.providerSMS.id);
          }
          return ids;
        });

      const updatedSelectedIDs = isChecked
        ? [...new Set([...prevData.selectedIDs, ...idsToUpdate])]
        : prevData.selectedIDs.filter(
            (id) =>
              !updatedMenuList.some(
                (item) =>
                  item.testId === rowId &&
                  (item.patientEmail.id === id ||
                    item.patientSMS.id === id ||
                    item.providerEmail.id === id ||
                    item.providerSMS.id === id),
              ),
          ); // setting ppSMSEMIAL : id insider

      return {
        ...prevData,
        menuList: updatedMenuList,
        selectedIDs: updatedSelectedIDs,
      };
    });
  };

  const handlePageChange = ({ page, pageSize }) => {
    setPage(page);
    setPageSize(pageSize);
  };

  const renderCell = (cell, row) => {
    // if (cell.info.header === "id") {
    //   return (
    //     <TableSelectRow
    //       key={cell.id}
    //       id={cell.id}
    //       // checked={selectedRowIds.includes(row.id)}
    //       name="selectRowCheckbox"
    //       ariaLabel="selectRows"
    //       // onSelect={() => {
    //       //   setDeactivateButton(false);
    //       //   if (selectedRowIds.includes(row.id)) {
    //       //     setSelectedRowIds(selectedRowIds.filter((id) => id !== row.id));
    //       //   } else {
    //       //     setSelectedRowIds([...selectedRowIds, row.id]);
    //       //   }
    //       // }}
    //     />
    //   );
    // } else

    if (cell.info.header === "testId") {
      return <TableCell key={cell.id}>{cell.value}</TableCell>;
    } else if (cell.info.header === "testName") {
      return <TableCell key={cell.id}>{cell.value}</TableCell>;
    } else if (
      cell.info.header === "patientEmail" ||
      cell.info.header === "patientSMS" ||
      cell.info.header === "providerEmail" ||
      cell.info.header === "providerSMS"
    ) {
      return (
        <TableCell key={cell.id}>
          <Checkbox
            id={cell.id}
            labelText=""
            checked={cell.value === "true"}
            onChange={(e) => {
              setSaveButton(false);
              handleCheckboxChange(e, row.id, cell.info.header);
            }}
          />
        </TableCell>
      );
    } else if (cell.info.header === "edit") {
      return (
        <TableCell key={cell.id}>
          <Button
            hasIconOnly
            iconDescription={intl.formatMessage({
              id: "testnotification.testdefault.editIcon",
            })}
            onClick={() => handleEditButtonClick(row.cells[0].value)}
            renderIcon={Settings}
            kind="tertiary"
          />
        </TableCell>
      );
    } else {
      return <TableCell key={cell.id}>{cell.value}</TableCell>;
    }
  };

  if (!loading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  return (
    <>
      {notificationVisible === true ? <AlertDialog /> : ""}
      <div className="adminPageContent">
        <PageBreadCrumb breadcrumbs={breadcrumbs} />
        <Grid fullWidth={true}>
          <Column lg={16} md={8} sm={4}>
            <Section>
              <Section>
                <Heading>
                  <FormattedMessage id="testnotificationconfig.browse.title" />
                </Heading>
              </Section>
            </Section>
          </Column>
        </Grid>
        <div className="orderLegendBody">
          <br />
          <Grid fullWidth={true}>
            <Column lg={16} md={8} sm={4}>
              <Button
                disabled={saveButton}
                onClick={testNotificationConfigMenuSavePostCall}
                type="button"
              >
                <FormattedMessage id="label.button.save" />
              </Button>{" "}
              <Button
                onClick={() =>
                  window.location.assign(
                    "/MasterListsPage#testNotificationConfigMenu",
                  )
                }
                kind="tertiary"
                type="button"
              >
                <FormattedMessage id="label.button.exit" />
              </Button>
            </Column>
          </Grid>
          <br />
          <Grid fullWidth={true}>
            <Column lg={16} md={8} sm={4}>
              <br />
              <DataTable
                // rows={testNamesList.slice(
                //   (page - 1) * pageSize,
                //   page * pageSize,
                // )}
                rows={
                  testNotificationConfigMenuDataPost?.menuList
                    // ?.slice((page - 1) * pageSize, page * pageSize)
                    ?.map((item) => ({
                      // id: `${item.testId}-${index}`,
                      id: item.testId,
                      testId: item.testId,
                      patientEmail: item.patientEmail.active ? "true" : "false",
                      patientSMS: item.patientSMS.active ? "true" : "false",
                      providerEmail: item.providerEmail.active
                        ? "true"
                        : "false",
                      providerSMS: item.providerSMS.active ? "true" : "false",
                      testName: testNamesMap[item.testId] || item.testId,
                    })) || []
                }
                headers={[
                  {
                    key: "testId",
                    header: intl.formatMessage({
                      id: "column.name.testId",
                    }),
                  },
                  {
                    key: "testName",
                    header: intl.formatMessage({
                      id: "label.testName",
                    }),
                  },
                  {
                    key: "patientEmail",
                    header: intl.formatMessage({
                      id: "testnotification.patient.email",
                    }),
                  },
                  {
                    key: "patientSMS",
                    header: intl.formatMessage({
                      id: "testnotification.patient.sms",
                    }),
                  },
                  {
                    key: "providerEmail",
                    header: intl.formatMessage({
                      id: "testnotification.provider.email",
                    }),
                  },
                  {
                    key: "providerSMS",
                    header: intl.formatMessage({
                      id: "testnotification.provider.sms",
                    }),
                  },
                  {
                    key: "edit",
                    header: intl.formatMessage({
                      id: "banner.menu.patientEdit",
                    }),
                  },
                ]}
              >
                {({
                  rows,
                  headers,
                  getHeaderProps,
                  getTableProps,
                  getSelectionProps,
                }) => (
                  <TableContainer>
                    <Table {...getTableProps()}>
                      <TableHead>
                        <TableRow>
                          {/* <TableSelectAll
                            id="table-select-all"
                            {...getSelectionProps()}
                            checked={
                              selectedRowIds.length === pageSize &&
                              searchedUserManagementListShow
                                .slice((page - 1) * pageSize, page * pageSize)
                                .filter(
                                  (row) =>
                                    !row.disabled &&
                                    selectedRowIds.includes(row.id),
                                ).length === pageSize
                            }
                            indeterminate={
                              selectedRowIds.length > 0 &&
                              selectedRowIds.length <
                                searchedUserManagementListShow
                                  .slice((page - 1) * pageSize, page * pageSize)
                                  .filter((row) => !row.disabled).length
                            }
                            onSelect={() => {
                              setDeactivateButton(false);
                              const currentPageIds =
                                searchedUserManagementListShow
                                  .slice((page - 1) * pageSize, page * pageSize)
                                  .filter((row) => !row.disabled)
                                  .map((row) => row.id);
                              if (
                                selectedRowIds.length === pageSize &&
                                currentPageIds.every((id) =>
                                  selectedRowIds.includes(id),
                                )
                              ) {
                                setSelectedRowIds([]);
                              } else {
                                setSelectedRowIds(
                                  currentPageIds.filter(
                                    (id) => !selectedRowIds.includes(id),
                                  ),
                                );
                              }
                            }}
                          /> */}
                          {headers.map((header) => (
                            // header.key !== "id" &&
                            <TableHeader
                              key={header.key}
                              {...getHeaderProps({ header })}
                            >
                              {header.header}
                            </TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <>
                          {rows.map((row) => (
                            <TableRow
                              key={row.id}
                              // onClick={() => {
                              //   const id = row.id;
                              //   const CombinedUserID = row.combinedUserID;
                              //   const isSelected = selectedRowIds.includes(id);
                              //   if (isSelected) {
                              //     setSelectedRowIds(
                              //       selectedRowIds.filter(
                              //         (selectedId) => selectedId !== id,
                              //       ),
                              //     );
                              //   } else {
                              //     setSelectedRowIds([...selectedRowIds, id]);
                              //   }
                              // }}
                            >
                              {row.cells.map((cell) => renderCell(cell, row))}
                            </TableRow>
                          ))}
                        </>
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
              {/* <Pagination
                onChange={handlePageChange}
                page={page}
                pageSize={pageSize}
                pageSizes={[25, 50]}
                totalItems={testNotificationConfigMenuDataPost?.menuList.length}
                forwardText={intl.formatMessage({
                  id: "pagination.forward",
                })}
                backwardText={intl.formatMessage({
                  id: "pagination.backward",
                })}
                itemRangeText={(min, max, total) =>
                  intl.formatMessage(
                    { id: "pagination.item-range" },
                    { min: min, max: max, total: total },
                  )
                }
                itemsPerPageText={intl.formatMessage({
                  id: "pagination.items-per-page",
                })}
                itemText={(min, max) =>
                  intl.formatMessage(
                    { id: "pagination.item" },
                    { min: min, max: max },
                  )
                }
                pageNumberText={intl.formatMessage({
                  id: "pagination.page-number",
                })}
                pageRangeText={(_current, total) =>
                  intl.formatMessage(
                    { id: "pagination.page-range" },
                    { total: total },
                  )
                }
                pageText={(page, pagesUnknown) =>
                  intl.formatMessage(
                    { id: "pagination.page" },
                    { page: pagesUnknown ? "" : page },
                  )
                }
              /> */}
              <br />
            </Column>
          </Grid>
          <br />
          <Grid fullWidth={true}>
            <Column lg={16} md={8} sm={4}>
              <Button
                disabled={saveButton}
                onClick={testNotificationConfigMenuSavePostCall}
                type="button"
              >
                <FormattedMessage id="label.button.save" />
              </Button>{" "}
              <Button
                onClick={() =>
                  window.location.assign(
                    "/MasterListsPage#testNotificationConfigMenu",
                  )
                }
                kind="tertiary"
                type="button"
              >
                <FormattedMessage id="label.button.exit" />
              </Button>
            </Column>
          </Grid>
          <button
            onClick={() => {
              console.log(testNotificationConfigMenuData);
            }}
          >
            testNotificationConfigMenuData
          </button>
          <button
            onClick={() => {
              console.log(testNotificationConfigMenuDataPost);
            }}
          >
            testNotificationConfigMenuDataPost
          </button>
          <button
            onClick={() => {
              console.log(testNamesList);
            }}
          >
            testNamesList
          </button>
        </div>
      </div>
    </>
  );
}

export default injectIntl(TestNotificationConfigMenu);
