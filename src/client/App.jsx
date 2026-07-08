import { useState, useEffect, useCallback } from 'react'
import {
  Button, Table, Input, InputNumber, Card, Space, Typography,
  Popconfirm, message, Row, Col, List, Tag, Divider, Empty
} from 'antd'
import {
  PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined,
  ExportOutlined, ClearOutlined, HolderOutlined, SaveOutlined,
  FileAddOutlined, HistoryOutlined, LeftOutlined, EditOutlined
} from '@ant-design/icons'
import * as XLSX from 'xlsx'
import EditableCell from './components/EditableCell'

const { Title, Text } = Typography

const API_BASE = '/api'

function App() {
  const [view, setView] = useState('list')
  const [quotations, setQuotations] = useState([])
  const [currentQuotation, setCurrentQuotation] = useState(null)
  const [items, setItems] = useState([])
  const [projectName, setProjectName] = useState('')
  const [projectDate, setProjectDate] = useState('')
  const [quoter, setQuoter] = useState('')
  const [taxRate, setTaxRate] = useState(6)
  const [saveStatus, setSaveStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const loadQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE}/quotations`)
      const data = await res.json()
      setQuotations(data)
    } catch (err) {
      message.error('加载报价单列表失败')
    }
  }

  useEffect(() => {
    loadQuotations()
  }, [])

  const calculateTotals = useCallback(() => {
    let install = 0
    let equip = 0
    items.forEach(item => {
      install += (parseFloat(item.qty) || 0) * (parseFloat(item.installPrice) || 0)
      equip += (parseFloat(item.qty) || 0) * (parseFloat(item.equipPrice) || 0)
    })
    const total = install + equip
    const taxAmount = total * (taxRate / 100)
    return {
      installSubtotal: install,
      equipSubtotal: equip,
      tax: taxAmount,
      grandTotal: total + taxAmount
    }
  }, [items, taxRate])

  const { installSubtotal, equipSubtotal, tax, grandTotal } = calculateTotals()

  const createNewQuotation = () => {
    setCurrentQuotation(null)
    setProjectName('')
    setProjectDate(new Date().toISOString().split('T')[0])
    setQuoter('')
    setTaxRate(6)
    setItems([])
    setView('edit')
  }

  const loadQuotation = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/quotations/${id}`)
      const data = await res.json()
      setCurrentQuotation(data)
      setProjectName(data.name || '')
      setProjectDate(data.date || '')
      setQuoter(data.quoter || '')
      setTaxRate(data.taxRate || 6)
      setItems(data.items || [])
      setView('edit')
    } catch (err) {
      message.error('加载报价单失败')
    } finally {
      setLoading(false)
    }
  }

  const saveQuotation = async () => {
    if (!projectName.trim()) {
      message.warning('请输入项目名称')
      return
    }

    setSaveStatus('保存中...')
    const data = {
      name: projectName,
      date: projectDate,
      quoter: quoter,
      taxRate: taxRate,
      items: items.map((item, index) => ({
        sortOrder: index,
        name: item.name || '',
        model: item.model || '',
        unit: item.unit || '',
        qty: parseFloat(item.qty) || 0,
        installPrice: parseFloat(item.installPrice) || 0,
        equipPrice: parseFloat(item.equipPrice) || 0,
        remark: item.remark || ''
      }))
    }

    try {
      let res
      if (currentQuotation) {
        res = await fetch(`${API_BASE}/quotations/${currentQuotation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      } else {
        res = await fetch(`${API_BASE}/quotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        const result = await res.json()
        if (result.id) {
          setCurrentQuotation({ ...data, id: result.id })
        }
      }

      if (res.ok) {
        message.success('保存成功')
        setSaveStatus('已保存')
        loadQuotations()
      } else {
        throw new Error('Save failed')
      }
    } catch (err) {
      message.error('保存失败')
      setSaveStatus('保存失败')
    }
  }

  const deleteQuotation = async (id) => {
    try {
      await fetch(`${API_BASE}/quotations/${id}`, { method: 'DELETE' })
      message.success('删除成功')
      loadQuotations()
      if (currentQuotation && currentQuotation.id === id) {
        createNewQuotation()
      }
    } catch (err) {
      message.error('删除失败')
    }
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
    setSaveStatus('未保存')
  }

  const addRow = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1
    setItems([...items, {
      id: newId,
      name: '',
      model: '',
      unit: '台',
      qty: 1,
      installPrice: 0,
      equipPrice: 0,
      remark: ''
    }])
    setSaveStatus('未保存')
  }

  const deleteRow = (index) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    setSaveStatus('未保存')
  }

  const moveRow = (index, direction) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= items.length) return
    const newItems = [...items]
    ;[newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]]
    setItems(newItems)
    setSaveStatus('未保存')
  }

  const clearAll = () => {
    setItems([])
    setProjectName('')
    setQuoter('')
    setSaveStatus('未保存')
  }

  const exportToExcel = () => {
    if (items.length === 0) {
      message.error('没有可导出的数据')
      return
    }

    let installSub = 0
    let equipSub = 0

    const aoa = []
    aoa.push([projectName || '报价单', '', '', '', '', '', '', '', '', ''])
    aoa.push(['报价日期：' + (projectDate || ''), '', '', '', '', '报价人：' + (quoter || ''), '', '', '', ''])
    aoa.push([])
    aoa.push(['序号', '设备名称', '规格型号', '单位', '数量', '安装单价', '安装合计', '设备单价', '设备合计', '备注'])

    items.forEach((item, i) => {
      const qty = parseFloat(item.qty) || 0
      const installTotal = qty * (parseFloat(item.installPrice) || 0)
      const equipTotal = qty * (parseFloat(item.equipPrice) || 0)
      installSub += installTotal
      equipSub += equipTotal

      aoa.push([
        i + 1, item.name, item.model, item.unit, qty,
        item.installPrice || 0, installTotal,
        item.equipPrice || 0, equipTotal, item.remark
      ])
    })

    const totalBeforeTax = installSub + equipSub
    const taxAmt = totalBeforeTax * (taxRate / 100)
    const grandTot = totalBeforeTax + taxAmt

    aoa.push([])
    aoa.push(['', '', '', '', '', '小计', installSub, '', equipSub, ''])
    aoa.push(['', '', '', '', '', `税点(${taxRate}%)`, '', '', taxAmt, ''])
    aoa.push(['', '', '', '', '', '总计', '', '', grandTot, ''])

    const ws = XLSX.utils.aoa_to_sheet(aoa)

    ws['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 15 }, { wch: 8 }, { wch: 8 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 25 }
    ]

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
      { s: { r: 1, c: 5 }, e: { r: 1, c: 9 } }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '报价单')

    const fileName = `${projectName || '报价单'}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    message.success('导出成功！')
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <Space>
          <HolderOutlined className="drag-handle" />
          {index + 1}
        </Space>
      )
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'name', val)}
          placeholder="设备名称"
        />
      )
    },
    {
      title: '规格型号',
      dataIndex: 'model',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'model', val)}
          placeholder="规格型号"
        />
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
      align: 'center',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'unit', val)}
          placeholder="单位"
        />
      )
    },
    {
      title: '数量',
      dataIndex: 'qty',
      width: 100,
      align: 'center',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'qty', val)}
          type="number"
        />
      )
    },
    {
      title: '安装单价',
      dataIndex: 'installPrice',
      width: 100,
      align: 'right',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'installPrice', val)}
          type="price"
        />
      )
    },
    {
      title: '安装合计',
      dataIndex: 'installTotal',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const total = (parseFloat(record.qty) || 0) * (parseFloat(record.installPrice) || 0)
        return <Text strong>{total.toFixed(2)}</Text>
      }
    },
    {
      title: '设备单价',
      dataIndex: 'equipPrice',
      width: 100,
      align: 'right',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'equipPrice', val)}
          type="price"
        />
      )
    },
    {
      title: '设备合计',
      dataIndex: 'equipTotal',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const total = (parseFloat(record.qty) || 0) * (parseFloat(record.equipPrice) || 0)
        return <Text strong>{total.toFixed(2)}</Text>
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      render: (text, record, index) => (
        <EditableCell
          value={text}
          onChange={(val) => updateItem(index, 'remark', val)}
          placeholder="备注"
        />
      )
    },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record, index) => (
        <Space size="small">
          <Button
            icon={<ArrowUpOutlined />}
            size="small"
            disabled={index === 0}
            onClick={() => moveRow(index, -1)}
          />
          <Button
            icon={<ArrowDownOutlined />}
            size="small"
            disabled={index === items.length - 1}
            onClick={() => moveRow(index, 1)}
          />
          <Popconfirm
            title="确定删除此项目？"
            onConfirm={() => deleteRow(index)}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      )
    }
  ]

  if (view === 'list') {
    return (
      <div className="app-container">
        <div className="page-header">
          <Title level={3} className="page-title">
            <HistoryOutlined style={{ marginRight: 12 }} />
            报价单列表
          </Title>
          <Button
            type="primary"
            icon={<FileAddOutlined />}
            onClick={createNewQuotation}
            size="large"
          >
            新建报价单
          </Button>
        </div>

        <Card>
          {quotations.length === 0 ? (
            <Empty description="暂无报价单，点击上方按钮创建" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={quotations}
              renderItem={item => (
                <List.Item
                  className="quotation-list-item"
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        loadQuotation(item.id)
                      }}
                    >
                      编辑
                    </Button>,
                    <Popconfirm
                      title="确定删除此报价单？"
                      onConfirm={() => deleteQuotation(item.id)}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      >
                        删除
                      </Button>
                    </Popconfirm>
                  ]}
                  onClick={() => loadQuotation(item.id)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.name || '未命名报价单'}</Text>
                        <Tag color="blue">税点 {item.taxRate}%</Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text type="secondary">日期：{item.date || '-'}</Text>
                        <Divider type="vertical" />
                        <Text type="secondary">报价人：{item.quoter || '-'}</Text>
                        <Divider type="vertical" />
                        <Text type="secondary">
                          更新：{new Date(item.updatedAt).toLocaleString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="page-header">
        <Space>
          <Button
            icon={<LeftOutlined />}
            onClick={() => setView('list')}
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}
          >
            返回列表
          </Button>
          <Title level={3} className="page-title" style={{ margin: 0 }}>
            {currentQuotation ? '编辑报价单' : '新建报价单'}
          </Title>
        </Space>
        <Space>
          <Button type="primary" icon={<SaveOutlined />} onClick={saveQuotation}>
            保存
          </Button>
          <Button icon={<ExportOutlined />} onClick={exportToExcel}>
            导出Excel
          </Button>
          <Popconfirm
            title="确定要清空所有项目吗？"
            onConfirm={clearAll}
          >
            <Button icon={<ClearOutlined />} danger>
              清空
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card className="card">
        <div className="form-row">
          <div className="form-item">
            <label>项目名称</label>
            <Input
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value)
                setSaveStatus('未保存')
              }}
              placeholder="请输入项目名称"
              style={{ width: 200 }}
            />
          </div>
          <div className="form-item">
            <label>报价日期</label>
            <Input
              type="date"
              value={projectDate}
              onChange={(e) => {
                setProjectDate(e.target.value)
                setSaveStatus('未保存')
              }}
              style={{ width: 150 }}
            />
          </div>
          <div className="form-item">
            <label>报价人</label>
            <Input
              value={quoter}
              onChange={(e) => {
                setQuoter(e.target.value)
                setSaveStatus('未保存')
              }}
              placeholder="请输入报价人"
              style={{ width: 150 }}
            />
          </div>
          <div className="tax-input-wrapper">
            <label>税点：</label>
            <InputNumber
              value={taxRate}
              onChange={(val) => {
                setTaxRate(val)
                setSaveStatus('未保存')
              }}
              min={0}
              max={100}
              step={0.1}
              precision={1}
              style={{ width: 80 }}
              addonAfter="%"
            />
          </div>
        </div>
      </Card>

      <Card className="card">
        <Row justify="space-between" align="middle">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={addRow}>
              新增项目
            </Button>
          </Col>
          <Col>
            <Text type="secondary">
              💡 提示：点击单元格可直接编辑，使用上下箭头可调整顺序
            </Text>
          </Col>
        </Row>
      </Card>

      <Card className="card" bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={items}
          columns={columns}
          rowKey={(record, index) => index}
          pagination={false}
          bordered
          locale={{ emptyText: '暂无报价项目' }}
          loading={loading}
        />

        {items.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr className="summary-row subtotal">
                <td colSpan={6} style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong>小计</Text>
                </td>
                <td style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong type="primary">{installSubtotal.toFixed(2)}</Text>
                </td>
                <td style={{ border: '1px solid #f0f0f0' }}></td>
                <td style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong type="primary">{equipSubtotal.toFixed(2)}</Text>
                </td>
                <td colSpan={2} style={{ border: '1px solid #f0f0f0' }}></td>
              </tr>
              <tr className="summary-row tax">
                <td colSpan={6} style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong>税点 ({taxRate}%)</Text>
                </td>
                <td colSpan={3} style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong type="warning">{tax.toFixed(2)}</Text>
                </td>
                <td colSpan={2} style={{ border: '1px solid #f0f0f0' }}></td>
              </tr>
              <tr className="summary-row total">
                <td colSpan={6} style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong style={{ fontSize: 16 }}>总计</Text>
                </td>
                <td colSpan={3} style={{ textAlign: 'right', padding: '12px 24px', border: '1px solid #f0f0f0' }}>
                  <Text strong type="success" style={{ fontSize: 16 }}>¥ {grandTotal.toFixed(2)}</Text>
                </td>
                <td colSpan={2} style={{ border: '1px solid #f0f0f0' }}></td>
              </tr>
            </tbody>
          </table>
        )}
      </Card>

      <div className="footer-bar">
        <div className="save-status">
          <span className="save-dot"></span>
          <span>{saveStatus || '未保存'}</span>
        </div>
        <Text type="secondary">报价单管理系统 v2.0</Text>
      </div>
    </div>
  )
}

export default App
