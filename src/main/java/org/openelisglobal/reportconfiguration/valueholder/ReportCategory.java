package org.openelisglobal.reportconfiguration.valueholder;

public class ReportCategory {

    private String id;
    private String name;
    private String menuElementId;
    private String sortOrder;
    private String parentId;

    public ReportCategory(String id, String name, String menuElementId, String sortOrder, String parentId) {
        this.id = id;
        this.name = name;
        this.menuElementId = menuElementId;
        this.sortOrder = sortOrder;
        this.parentId = parentId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMenuElementId() {
        return menuElementId;
    }

    public void setMenuElementId(String menuElementId) {
        this.menuElementId = menuElementId;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }
}
